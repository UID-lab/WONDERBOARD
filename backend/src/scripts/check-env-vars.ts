import dotenv from "dotenv";

// Load environment variables
dotenv.config();

console.log("🔍 Checking Environment Variables...");
console.log("=" .repeat(50));

console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
console.log("🔑 EMAIL_PASS:", process.env.EMAIL_PASS ? `${process.env.EMAIL_PASS.substring(0, 4)}****${process.env.EMAIL_PASS.substring(process.env.EMAIL_PASS.length - 4)}` : "NOT SET");
console.log("🔑 EMAIL_PASS Length:", process.env.EMAIL_PASS?.length || 0);
console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL);

console.log("\n🧪 Testing Gmail Connection...");

import nodemailer from "nodemailer";

async function quickTest() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    await transporter.verify();
    console.log("✅ Gmail connection successful!");
    return true;
  } catch (error: any) {
    console.log("❌ Gmail connection failed:", error.message);
    return false;
  }
}

quickTest().then((success) => {
  console.log("\n" + "=".repeat(50));
  if (success) {
    console.log("🎉 Environment variables are loaded correctly!");
    console.log("📝 If emails still fail in your app, restart your backend server:");
    console.log("   1. Stop the server (Ctrl+C)");
    console.log("   2. Run: npm run server");
  } else {
    console.log("❌ Environment variables need attention");
  }
  process.exit(success ? 0 : 1);
});