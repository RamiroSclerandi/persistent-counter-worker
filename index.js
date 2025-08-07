const Redis = require("ioredis");
const axios = require("axios");

// Environment variables for Redis connection and reset endpoint
const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  RESET_ENDPOINT_URL,
  RESET_SECRET,
  COUNTER_KEY = "contador_reset"
} = process.env;

// Redis client configuration
const sub = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
});

// Pattern to listen for expiration events across all databases
const EXPIRED_PATTERN = "__keyevent@*__:expired";
const EXPIRED_CHANNEL_PREFIX = "__keyevent@";

/* MAIN FUNCTION */

async function main() {
  console.log("Connecting to Redis and setting up listener...");

  // Event that triggers when the Redis client connects
  sub.on("connect", async () => {
    console.log("Redis client connected.");
    try {
      // Enable keyspace notifications for expiration events ('Ex' notifies about expired keys)
      await sub.config("SET", "notify-keyspace-events", "Ex");
      console.log("Keyspace notifications enabled for 'Ex' events.");

      // Subscribe to the expiration event pattern
      await sub.psubscribe(EXPIRED_PATTERN);
      console.log(`Worker subscribed to pattern: ${EXPIRED_PATTERN}`);
      console.log("Worker is now listening for Redis expirations...");
    } catch (err) {
      console.error("Failed to set up Redis subscription:", err.message);
    }
  });

  // Event that triggers when a message matching the pattern is received
  sub.on("pmessage", async (pattern, channel, message) => {
    console.log(`Received message: "${message}" from channel: "${channel}" on pattern: "${pattern}"`);

    // Check if the event is an expiration and if the key is the one we're interested in
    if (channel.startsWith(EXPIRED_CHANNEL_PREFIX) && message === COUNTER_KEY) {
      console.log("Counter key expired, triggering backend reset...");

      try {
        await axios.post(
          RESET_ENDPOINT_URL,
          {},
          {
            headers: { "x-secret": RESET_SECRET },
          }
        );
        console.log("Reset endpoint called successfully!");
      } catch (err) {
        // Detailed error handling for the API call
        if (err.response) {
          console.error(`Reset failed with status ${err.response.status}:`, err.response.data);
        } else if (err.request) {
          console.error("Reset failed: No response received from the server.", err.message);
        } else {
          console.error("Reset failed with error:", err.message);
        }
      }
    }
  });

  // Connection error handling
  sub.on("error", (err) => {
    console.error("Redis client error:", err.message);
  });
}

main().catch(console.error);