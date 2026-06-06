import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import dotenv from "dotenv";

dotenv.config();

Sentry.init({
  dsn: "https://ab78ac9d9d81b37821ee03b7286b551d@o4511445346222080.ingest.us.sentry.io/4511445349629952",
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

// Import Refactored Modules
import { connectDB } from "./config/db.js";
import { pubClient, subClient } from "./config/redis.js";
import { socketAuthMiddleware } from "./middleware/auth.js";
import { setupRoutes } from "./routes/api.js";
import { setupSocketHandlers } from "./handlers/socketHandlers.js";

// Initialize DB Connection
await connectDB();

const app = express();
app.use(express.json());

const server = http.createServer(app);
const port = process.env.PORT || 5000;

// Initialize Socket.io Server with Redis Adapter
const io = new Server(server, {
  cors: {
    origin: process.env.NEXT_BASE_URL
  },
  adapter: createAdapter(pubClient, subClient)
});

// Setup Express Routes
setupRoutes(app, io);

// Setup Socket.io Middleware
io.use(socketAuthMiddleware);

// Setup Socket.io Event Handlers
io.on("connection", async (socket) => {
  await setupSocketHandlers(io, socket);
});

// Start Server
server.listen(port, () => {
  console.log("Server started at port", port);
});
