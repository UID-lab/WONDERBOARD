import "dotenv/config";
import { sendTaskAssignmentEmail } from "../services/email.service";

const testGmail = async () => {
  console.log("🧪 Testing Gmail email delivery...");

  try {
    console.log("📧 Sending test email via Gmail...");
    
    const result = await sendTaskAssignmentEmail(
      "wonderwomanla95@gmail.com",
      "Wonder Woman LA",
      "Gmail Test Task",
      "This is a test email sent through Gmail SMTP to verify real email delivery.",
      "Gilbert Stanley",
      "gilbertstanley311@gmail.com",
      "test-workspace-id",
      "test-task-id"
    );

    console.log("📧 Email result:", result);
    
    if (result.success) {
      console.log("✅ Gmail email sent successfully!");
      console.log("📬 Check the inbox of wonderwomanla95@gmail.com");
      console.log("📤 Email should appear as sent from gilbertstanley311@gmail.com");
    } else {
      console.log("❌ Email sending failed");
    }

  } catch (error) {
    console.error("❌ Gmail test failed:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("Invalid login")) {
        console.log("🔑 Gmail authentication failed. Please check:");
        console.log("   1. EMAIL_USER is correct in .env");
        console.log("   2. EMAIL_PASS is the App Password (not regular password)");
        console.log("   3. 2-Factor Authentication is enabled on Gmail");
        console.log("   4. App Password was generated correctly");
      }
    }
  }
};

testGmail().catch(console.error);