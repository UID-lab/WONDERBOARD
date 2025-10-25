import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables
dotenv.config();

async function validateGmailCredentials() {
  console.log("🔍 Validating Gmail credentials...");
  
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  if (!emailUser || !emailPass) {
    console.error("❌ Gmail credentials not found in .env file");
    console.error("📝 Please set EMAIL_USER and EMAIL_PASS in your .env file");
    return false;
  }
  
  console.log("📧 Email User:", emailUser);
  console.log("🔑 Password Length:", emailPass.length, "characters");
  
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    
    // Verify connection
    console.log("🔗 Testing Gmail SMTP connection...");
    await transporter.verify();
    
    console.log("✅ Gmail credentials are valid!");
    console.log("📧 SMTP connection successful");
    
    return true;
    
  } catch (error: any) {
    console.error("❌ Gmail validation failed:", error.message);
    
    if (error.code === 'EAUTH') {
      console.error("\n🔐 Authentication Error - Common Solutions:");
      console.error("1. 📱 Enable 2-Factor Authentication on your Gmail account");
      console.error("2. 🔑 Generate an App Password (not your regular Gmail password)");
      console.error("3. 📝 Update EMAIL_PASS in .env with the 16-character app password");
      console.error("4. 🔄 Restart your application after updating .env");
      console.error("\n📖 See GMAIL_SETUP_GUIDE.md for detailed instructions");
    } else if (error.code === 'ECONNECTION') {
      console.error("\n🌐 Connection Error - Check:");
      console.error("1. 📡 Internet connection");
      console.error("2. 🔥 Firewall settings");
      console.error("3. 🏢 Corporate network restrictions");
    }
    
    return false;
  }
}

// Run validation
validateGmailCredentials().then((isValid) => {
  if (isValid) {
    console.log("\n🎉 Gmail is ready to send emails!");
    console.log("🚀 You can now test with: npm run test-email");
  } else {
    console.log("\n❌ Gmail setup needs attention");
    console.log("📖 Please follow the GMAIL_SETUP_GUIDE.md");
  }
  process.exit(isValid ? 0 : 1);
}).catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});