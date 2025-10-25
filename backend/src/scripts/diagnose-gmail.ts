import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables
dotenv.config();

async function diagnoseGmailIssue() {
  console.log("🔍 Diagnosing Gmail Authentication Issue...");
  
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  console.log("📧 EMAIL_USER:", emailUser);
  console.log("🔑 EMAIL_PASS length:", emailPass?.length);
  console.log("🔑 EMAIL_PASS (masked):", emailPass?.replace(/./g, '*'));
  console.log("🔑 EMAIL_PASS (raw):", `"${emailPass}"`);
  
  // Check for common issues
  if (emailPass?.includes(' ')) {
    console.log("⚠️  Password contains spaces - this is normal for Gmail App Passwords");
  }
  
  if (emailPass && emailPass.length !== 16 && emailPass.length !== 19) {
    console.log("⚠️  Password length is unusual. Gmail App Passwords are usually 16 characters (or 19 with spaces)");
  }
  
  try {
    console.log("\n🔗 Testing Gmail SMTP connection...");
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      debug: true, // Enable debug mode
      logger: true // Enable logging
    });
    
    // Test connection
    await transporter.verify();
    console.log("✅ SMTP connection successful!");
    
    // Try sending a test email
    console.log("\n📧 Attempting to send test email...");
    const info = await transporter.sendMail({
      from: `"Wonder Board Test" <${emailUser}>`,
      to: emailUser, // Send to yourself
      subject: "🧪 Gmail Test Email",
      html: `
        <h2>Gmail Test Successful!</h2>
        <p>This email confirms that Gmail SMTP is working correctly.</p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `
    });
    
    console.log("✅ Test email sent successfully!");
    console.log("📧 Message ID:", info.messageId);
    console.log("📬 Check your Gmail inbox for the test email");
    
  } catch (error: any) {
    console.error("❌ Gmail test failed:", error.message);
    
    if (error.code === 'EAUTH') {
      console.error("\n🔐 Authentication Error Details:");
      console.error("Response:", error.response);
      console.error("Response Code:", error.responseCode);
      
      console.error("\n🛠️  Troubleshooting Steps:");
      console.error("1. 🔄 Generate a NEW Gmail App Password");
      console.error("2. 📝 Copy it EXACTLY (including spaces)");
      console.error("3. 🔄 Update EMAIL_PASS in .env file");
      console.error("4. 🔄 Restart your application");
      console.error("5. ✅ Ensure 2FA is enabled on Gmail");
    }
    
    return false;
  }
  
  return true;
}

// Run diagnosis
diagnoseGmailIssue().then((success) => {
  if (success) {
    console.log("\n🎉 Gmail is working correctly!");
  } else {
    console.log("\n❌ Gmail needs to be fixed");
  }
  process.exit(success ? 0 : 1);
}).catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});