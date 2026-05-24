import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://ab78ac9d9d81b37821ee03b7286b551d@o4511445346222080.ingest.us.sentry.io/4511445349629952",
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

import express from "express"
import http from "http"
import dotenv from "dotenv"
import { Server } from "socket.io"
import axios from "axios"
import Redis from "ioredis"
import crypto from "crypto"

dotenv.config()

const redis = new Redis(process.env.UPSTASH_REDIS_URL)

import mongoose from "mongoose"
import User from "./models/user.models.js"

await mongoose.connect(process.env.MONGODB_URL)
const app=express()
app.use(express.json())
const server=http.createServer(app)
const port=process.env.PORT || 5000

const io=new Server(server,{
    cors:{
        origin:process.env.NEXT_BASE_URL
    }
})



app.post("/emit", async (req, res) => {
  const { userId, event, data } = req.body;

  try {
    const user = await User.findById(userId);

    if (user?.socketId) {
      io.to(user.socketId).emit(event, data);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

app.post("/emit-room", (req, res) => {
  const { room, event, data } = req.body;
  if (room && event) {
    io.to(room).emit(event, data);
  }
  res.json({ success: true });
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error: Token missing"));
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 2) throw new Error("Invalid token format");
    
    const [userId, signature] = parts;
    const secret = process.env.AUTH_SECRET || "fallback_secret";
    
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(userId);
    const expectedSignature = hmac.digest("hex");

    if (signature !== expectedSignature) {
      throw new Error("Signature mismatch");
    }

    // Attach verified user ID to the socket
    socket.userId = userId;
    next();
  } catch (error) {
    return next(new Error("Authentication error: " + error.message));
  }
});

io.on("connection", (socket) => {

  socket.on("identity", async (userId) => {

    socket.userId = userId

    await User.findByIdAndUpdate(userId, {
      socketId: socket.id,
      isOnline: true
    })

  })

// server.js — sab jagah ek hi format rakho

socket.on("join-booking", (bookingId) => {
  console.log("joining room:", `booking-${bookingId}`);
  socket.join(`booking-${bookingId}`);  // ← prefix add karo
});

socket.on("driver-location-update", (data) => {
  io.to(`booking-${data.bookingId}`)   // ✅ already sahi
    .emit("driver-location", {
      latitude: data.latitude,
      longitude: data.longitude,
      status: "arriving"
    });
});

socket.on("chat-message", (msg) => {
  console.log("chat to room:", `booking-${msg.rideId}`);
  io.to(`booking-${msg.rideId}`).emit("chat-message", msg);  // ← prefix add karo
});

  socket.on("update-location", async ({ latitude, longitude }) => {
    if (!socket.userId) return

    try {
      await redis.geoadd("driver-locations", longitude, latitude, socket.userId)
    } catch (error) {
      console.error("Redis geoadd error:", error)
    }
  })
 

  socket.on("disconnect", async () => {
    if (!socket.userId) return

    try {
      await redis.zrem("driver-locations", socket.userId)
    } catch (error) {
      console.error("Redis zrem error:", error)
    }

    await User.findByIdAndUpdate(socket.userId, {
      isOnline: false,
      socketId: null
    })
  })

})






server.listen(port,()=>{
    console.log("server started at",port)
})
