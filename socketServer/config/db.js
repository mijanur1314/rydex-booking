import mongoose from "mongoose";

/**
 * Connects to the MongoDB database using the MONGODB_URL environment variable.
 * Gracefully handles connection errors and logs them.
 */
export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URL) {
      throw new Error("MONGODB_URL environment variable is not defined.");
    }
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB successfully.");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    process.exit(1); // Exit process with failure
  }
};
