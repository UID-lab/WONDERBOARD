import mongoose from "mongoose";
import { config } from "./app.config";

const connectDatabase = async () => {
  try {
    console.log("🔄 Attempting to connect to MongoDB...");
    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    console.log("✅ Connected to MongoDB database");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB database:");
    if (error instanceof Error) {
      console.error("📍 Error message:", error.message);
      console.error("🔍 Error name:", error.name);
    }
    console.error("🔗 MongoDB URI configured:", config.MONGO_URI ? "Yes" : "No");
    console.error("⚠️  Server will exit due to database connection failure");
    process.exit(1);
  }
};

export default connectDatabase;
