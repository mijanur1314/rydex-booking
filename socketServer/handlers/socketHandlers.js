import User from "../models/user.models.js";
import { redis } from "../config/redis.js";

/**
 * @typedef {Object} DriverLocationUpdatePayload
 * @property {string} bookingId - The ID of the booking/ride
 * @property {number} latitude - Driver's current latitude
 * @property {number} longitude - Driver's current longitude
 */

/**
 * @typedef {Object} ChatMessagePayload
 * @property {string} rideId - The ID of the ride this chat belongs to
 * @property {string} senderId - ID of the sender
 * @property {string} text - Message content
 * @property {Date} [timestamp] - Optional timestamp of the message
 */

/**
 * @typedef {Object} UpdateLocationPayload
 * @property {number} latitude - User's current latitude
 * @property {number} longitude - User's current longitude
 */

/**
 * Sets up all socket event listeners for an authenticated connection.
 * @param {import("socket.io").Server} io - The Socket.IO server instance
 * @param {import("socket.io").Socket} socket - The authenticated socket connection
 */
export const setupSocketHandlers = async (io, socket) => {
  // Update the user's socket ID in the database on initial connection
  if (socket.userId) {
    try {
      await User.findByIdAndUpdate(socket.userId, {
        socketId: socket.id
      });
    } catch (error) {
      console.error(`Error updating socketId for user ${socket.userId}:`, error.message);
    }
  }

  /**
   * Event: identity
   * Used to manually assert the user's identity and update socket mapping.
   * @param {string} userId
   */
  socket.on("identity", async (userId) => {
    socket.userId = userId;
    try {
      await User.findByIdAndUpdate(userId, {
        socketId: socket.id
      });
    } catch (error) {
      console.error(`Error in 'identity' handler for user ${userId}:`, error.message);
    }
  });

  /**
   * Event: join-booking
   * Allows a user or driver to join a specific booking room.
   * @param {string} bookingId
   */
  socket.on("join-booking", (bookingId) => {
    console.log("Joining room:", `booking-${bookingId}`);
    socket.join(`booking-${bookingId}`);
  });

  /**
   * Event: driver-location-update
   * Broadcasts driver location to everyone in the booking room.
   * @param {DriverLocationUpdatePayload} data
   */
  socket.on("driver-location-update", (data) => {
    try {
      io.to(`booking-${data.bookingId}`).emit("driver-location", {
        latitude: data.latitude,
        longitude: data.longitude,
        status: "arriving"
      });
    } catch (error) {
      console.error(`Error in 'driver-location-update':`, error.message);
    }
  });

  /**
   * Event: chat-message
   * Relays a chat message to the booking room.
   * @param {ChatMessagePayload} msg
   */
  socket.on("chat-message", (msg) => {
    console.log("Chat to room:", `booking-${msg.rideId}`);
    io.to(`booking-${msg.rideId}`).emit("chat-message", msg);
  });

  /**
   * Event: update-location
   * Updates a vendor's geo-location in Redis for efficient nearby searching.
   * @param {UpdateLocationPayload} payload
   */
  socket.on("update-location", async ({ latitude, longitude }) => {
    if (!socket.userId) return;

    try {
      const user = await User.findById(socket.userId).select("role isOnline");
      if (user?.role === "vendor" && user.isOnline) {
        await redis.geoadd("driver-locations", longitude, latitude, socket.userId);
      }
    } catch (error) {
      console.error("Redis geoadd error in 'update-location':", error.message);
    }
  });

  /**
   * Event: disconnect
   * Cleans up user presence when socket disconnects.
   */
  socket.on("disconnect", async () => {
    if (!socket.userId) return;

    try {
      await redis.zrem("driver-locations", socket.userId);
    } catch (error) {
      console.error("Redis zrem error in 'disconnect':", error.message);
    }

    try {
      await User.findOneAndUpdate(
        { _id: socket.userId, socketId: socket.id },
        { socketId: null }
      );
    } catch (error) {
      console.error(`Error clearing socketId on disconnect for user ${socket.userId}:`, error.message);
    }
  });
};
