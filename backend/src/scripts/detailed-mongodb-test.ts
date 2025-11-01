import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

async function detailedMongoDBTest() {
  console.log("🔍 Detailed MongoDB Connection Test...");
  console.log("=" .repeat(60));
  
  const mongoUri = process.env.MONGO_URI;
  
  console.log("📋 Connection Details:");
  console.log("🔗 MongoDB URI exists:", mongoUri ? "✅ Yes" : "❌ No");
  
  if (mongoUri) {
    // Parse the URI to show details (without password)
    const uriParts = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);
    if (uriParts) {
      console.log("👤 Username:", uriParts[1]);
      console.log("🔑 Password:", "****" + uriParts[2].slice(-4));
      console.log("🏠 Cluster:", uriParts[3]);
      console.log("📊 Database:", uriParts[4].split('?')[0]);
    }
  }
  
  console.log("\n🔄 Testing Connection with Different Options...");
  
  // Test 1: Basic connection
  try {
    console.log("\n1️⃣ Testing basic connection...");
    await mongoose.connect(mongoUri as string, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    
    console.log("✅ Basic connection successful!");
    console.log("📊 Database:", mongoose.connection.db?.databaseName);
    console.log("🏠 Host:", mongoose.connection.host);
    
    // Test database operations
    const collections = await mongoose.connection.db?.listCollections().toArray();
    console.log("📁 Collections found:", collections?.length || 0);
    
    if (collections && collections.length > 0) {
      console.log("📋 Collection names:", collections.map(c => c.name).join(", "));
    }
    
    await mongoose.disconnect();
    console.log("🔌 Disconnected successfully");
    
    return true;
    
  } catch (error: any) {
    console.error("❌ Connection failed:", error.message);
    
    // Detailed error analysis
    if (error.message.includes("authentication failed")) {
      console.error("\n🔐 Authentication Issue:");
      console.error("- Check username and password in MongoDB URI");
      console.error("- Verify database user exists in Atlas");
      console.error("- Check user permissions");
    } else if (error.message.includes("IP")) {
      console.error("\n📡 IP Whitelist Issue:");
      console.error("- Verify 0.0.0.0/0 is in Network Access");
      console.error("- Wait 1-2 minutes after adding IP");
      console.error("- Check if entry is 'Active'");
    } else if (error.message.includes("ENOTFOUND") || error.message.includes("getaddrinfo")) {
      console.error("\n🌐 DNS/Network Issue:");
      console.error("- Check internet connection");
      console.error("- Verify cluster hostname is correct");
      console.error("- Try different network if possible");
    } else if (error.message.includes("timeout")) {
      console.error("\n⏰ Timeout Issue:");
      console.error("- Network might be slow");
      console.error("- Cluster might be paused/sleeping");
      console.error("- Check Atlas cluster status");
    }
    
    console.error("\n🛠️ Troubleshooting Steps:");
    console.error("1. 🌐 Go to MongoDB Atlas dashboard");
    console.error("2. 🔍 Check cluster status (should be running)");
    console.error("3. 📡 Verify Network Access shows 0.0.0.0/0 as Active");
    console.error("4. 👤 Check Database Access for user 'gilbert'");
    console.error("5. ⏰ Wait a few minutes and try again");
    
    return false;
  }
}

// Run the detailed test
detailedMongoDBTest().then((success) => {
  console.log("\n" + "=".repeat(60));
  if (success) {
    console.log("🎉 MongoDB connection is working!");
    console.log("🚀 You can now start your server and test emails!");
  } else {
    console.log("❌ MongoDB connection needs attention");
    console.log("⏰ If you just added IP whitelist, wait 2-3 minutes and try again");
  }
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});