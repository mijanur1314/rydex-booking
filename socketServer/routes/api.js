import express from "express";
import User from "../models/user.models.js";

const router = express.Router();

/**
 * Applies the API routes to the given app instance.
 * @param {import("express").Express} app 
 * @param {import("socket.io").Server} io 
 */
export const setupRoutes = (app, io) => {
  
  /**
   * @route POST /emit
   * @description Emits an event to a specific user's socket
   * @param {Object} req.body - Request payload
   * @param {string} req.body.userId - Target user's ID
   * @param {string} req.body.event - Event name to emit
   * @param {any} req.body.data - Data payload for the event
   */
  app.post("/emit", async (req, res) => {
    const { userId, event, data } = req.body;

    try {
      const user = await User.findById(userId);

      if (user?.socketId) {
        io.to(user.socketId).emit(event, data);
      } else {
        console.warn(`Emit Warning: User ${userId} not found or socketId is missing.`);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error in /emit route:", error.message);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  });

  /**
   * @route POST /emit-room
   * @description Emits an event to a specific socket.io room
   * @param {Object} req.body - Request payload
   * @param {string} req.body.room - Target room name
   * @param {string} req.body.event - Event name to emit
   * @param {any} req.body.data - Data payload for the event
   */
  app.post("/emit-room", (req, res) => {
    const { room, event, data } = req.body;
    
    if (!room || !event) {
      console.warn("Emit-room Warning: Missing room or event in request body.");
      return res.status(400).json({ success: false, error: "Missing room or event" });
    }

    try {
      io.to(room).emit(event, data);
      res.json({ success: true });
    } catch (error) {
      console.error("Error in /emit-room route:", error.message);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  });

};
