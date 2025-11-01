import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

async function testMongoDBConnection() {
  console.log("🔍 Testing MongoDB Connection...");
  console.log("📍 Your current IP:", "202.83.18.73");
  console.log(
    "🔗 MongoDB URI:",
    process.env.MONGO_URI ? "✅ Configured" : "❌ Not found"
  );

  try {
    console.log("\n🔄 Attempting to connect to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI as string);

    console.log("✅ MongoDB connection successful!");
    console.log("📊 Database name:", mongoose.connection.db?.databaseName);
    console.log("🏠 Host:", mongoose.connection.host);
    console.log("🔌 Port:", mongoose.connection.port);

    // Test a simple query
    const collections = await mongoose.connection.db
      ?.listCollections()
      .toArray();
    console.log("📁 Collections found:", collections?.length || 0);

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");

    return true;
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:");
    console.error("📍 Error:", error.message);

    if (error.message.includes("IP")) {
      console.error("\n🛠️  IP Whitelist Issue:");
      console.error("1. 🌐 Go to MongoDB Atlas: https://cloud.mongodb.com/");
      console.error("2. 📡 Click 'Network Access' in sidebar");
      console.error("3. ➕ Click 'Add IP Address'");
      console.error("4. 📍 Add your IP: 202.83.18.73");
      console.error("5. 💾 Save and wait 1-2 minutes");
      console.error("\n🔓 Or for development, allow all IPs: 0.0.0.0/0");
    }

    return false;
  }
}

// Run the test
testMongoDBConnection()
  .then((success) => {
    console.log("\n" + "=".repeat(50));
    if (success) {
      console.log("🎉 MongoDB is ready!");
      console.log("🚀 You can now start your server with: npm run server");
    } else {
      console.log("❌ Fix MongoDB connection before starting server");
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
