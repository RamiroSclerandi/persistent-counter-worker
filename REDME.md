# persistent-counter-worker

A background worker for automatic counter resets, designed to work with the [persistent-counter](https://github.com/RamiroSclerandi/persistent-counter) project.

---

## 🚀 What is this?

This project is a lightweight Node.js worker that monitors a Redis key and triggers a remote reset of a global counter application after a configurable period of inactivity.  
It is intended to be used as a companion service for the [persistent-counter](https://github.com/RamiroSclerandi/persistent-counter) app, but can be adapted for other similar use-cases.

---

## 💡 How does it work?

- The main app sets a Redis key (e.g., `contador_reset`) with an expiration (e.g., 20 minutes) every time the counter is updated.

- This worker subscribes to Redis key expiration events.

- When the key expires (i.e., no activity for X minutes), the worker sends a secure HTTP POST request to the backend, indicating that the counter should be reset.

- The backend endpoint resets the counter and updates clients in real-time.

---

## 🛠️ Features

- Simple and reliable: uses Redis key expiration for inactivity detection.
- Decoupled: runs independently from your main app and database.
- Deploy anywhere: works perfectly on [Railway](https://railway.app/), [Render](https://render.com/), or any Node.js-compatible host.
- Customizable: easily change the key name, expiration time, and backend reset URL.

---

## 🧑‍💻 For developers

### Requirements

- Node.js 18+
- Access to a running Redis instance (host, port, and password)
- A backend endpoint for resetting the counter (should be protected by a secret)

### Environment Variables

Create a `.env` file (see `.env.example`):

```env
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password
RESET_ENDPOINT_URL=https://your-backend-url.com/api/reset-counter
RESET_SECRET=your_super_secret
COUNTER_KEY=contador_reset
```

- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`: Credentials for your Redis instance.
- `RESET_ENDPOINT_URL`: The URL of your backend's reset endpoint.
- `RESET_SECRET`: Secret to authenticate the reset request.
- `COUNTER_KEY`: (Optional) Redis key to listen for expiration. Defaults to `contador_reset`.

### Running locally

```bash
pnpm install
pnpm start
```

You should see logs confirming the worker is listening for key expiration events.

---

## ☁️ Deploying on Railway

1. **Fork or clone this repo.**
2. **Create a new Railway project** and connect your GitHub repository.
3. **Provision a Redis instance** from Railway's dashboard.
4. **Set all environment variables** as described above in the Railway dashboard.
5. **Deploy!** Logs will show when the worker is active and when resets are triggered.

---

## 🔒 Security

- The reset endpoint should always verify the `RESET_SECRET` value sent in the `x-secret` header.
- Do not expose your reset endpoint publicly without authentication.

---

## 🤝 Integration

- This worker is designed to pair with [persistent-counter](https://github.com/RamiroSclerandi/persistent-counter).
- You may adapt it for other projects needing inactivity-based resets or similar triggers.

---

## 📝 Example sequence

1. User increments the counter from the frontend.
2. The backend sets a Redis key with a 20-minute expiration.
3. If no further updates occur, the key expires.
4. The worker detects the expiration and POSTs to the backend to reset the counter.
5. All connected clients receive the update in real-time.

---

## 📦 Project structure

```
persistent-counter-worker/
  index.js
  .env.example
  package.json
  README.md
```

---

## 📜 License

MIT

---

## 🙋 Contact

Developed by Ramiro Sclerandi.  
Feel free to contact with me via GitHub for feedback or improvements.
