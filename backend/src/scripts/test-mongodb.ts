import "dotenv/config";
import mongoose from "mongoose";
import { config } from "../config/app.config";

const testMongoDB = async () => {
  console.log("🔍 Testing MongoDB connection...");
  console.log("📍 MongoDB URI:", config.MONGO_URI ? "URI is set" : "URI is missing");
  
  try {
    console.log("🔄 Attempting to connect...");
    await mongoose.connect(config.MONGO_URI);
    console.log("✅ Successfully connected to MongoDB!");
    
    // Test a simple query
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log("📊 Available collections:", collections.map(c => c.name));
    }
    
    await mongoose.connection.close();
    console.log("🔌 Connection closed successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    if (error instanceof Error) {
      console.error("🔍 Error details:", {
        name: error.name,
        message: error.message,
        code: (error as any).code
      });
    }
  }
};

testMongoDB().catch(console.error);