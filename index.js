const Redis = require("ioredis");
const axios = require("axios");

// Environment variables configuration
const {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  RESET_ENDPOINT_URL,
  RESET_SECRET,
  COUNTER_KEY = "contador_reset"
} = process.env;

// Redis client configuration
const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
});

// Enable keyspace notifications for expired events
async function enableKeyspaceNotifications() {
  await redis.config("SET", "notify-keyspace-events", "Ex");
  console.log("Keyspace notifications enabled.");
}

async function main() {
  await enableKeyspaceNotifications();

  // Worker that listens for expirations
  const sub = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
  });

  const EXPIRED_CHANNEL = "__keyevent@0__:expired";
  await sub.subscribe(EXPIRED_CHANNEL);

  sub.on("message", async (channel, message) => {
    if (channel === EXPIRED_CHANNEL && message === COUNTER_KEY) {
      console.log("Counter expired, triggering backend reset...");

      try {
        await axios.post(
          RESET_ENDPOINT_URL,
          {},
          {
            headers: { "x-secret": RESET_SECRET },
          }
        );
        console.log("Reset called successfully!");
      } catch (err) {
        console.error("Reset failed:", err.message);
      }
    }
  });

  console.log("Worker listening for Redis expirations...");
}

main().catch(console.error);