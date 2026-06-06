import crypto from "crypto";

/**
 * Socket.IO authentication middleware.
 * Verifies the provided token and attaches the verified userId to the socket.
 * 
 * @param {import("socket.io").Socket} socket - The Socket.IO socket instance
 * @param {Function} next - Callback function to proceed to the next middleware
 */
export const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    const err = new Error("Authentication error: Token missing");
    console.error("Socket Auth Error:", err.message);
    return next(err);
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
    const err = new Error("Authentication error: " + error.message);
    console.error(`Socket Auth Error for token [${token}]:`, error.message);
    return next(err);
  }
};
