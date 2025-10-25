import dotenv from "dotenv";
import { sendTaskAssignmentEmail, sendTaskReassignmentEmail } from "../services/email.service";

// Load environment variables
dotenv.config();

async function testRealEmail() {
  console.log("🧪 Testing email with real recipient...");
  
  // You can change this to any real email address you want to test with
  const testRecipientEmail = "gilbertstanley311@gmail.com"; // Send to yourself for testing
  
  try {
    console.log("\n📧 Sending task assignment email to:", testRecipientEmail);
    
    const assignmentResult = await sendTaskAssignmentEmail(
      testRecipientEmail, // Send to yourself for testing
      "Gilbert Stanley", // Your name
      "Test Task Assignment", // Task title
      "This is a test email to verify that the email system is working correctly. You should receive this email in your Gmail inbox.", // Task description
      "System Admin", // Assigned by
      "admin@wonderboard.com", // Assigned by email
      "test-workspace-123", // Workspace ID
      "test-task-456" // Task ID
    );
    
    console.log("✅ Assignment email result:", assignmentResult);
    
    if (assignmentResult.success) {
      console.log("\n🎉 Email sent successfully!");
      console.log("📬 Check your Gmail inbox for the email");
      console.log("📧 From: gilbertstanley311@gmail.com");
      console.log("📧 To:", testRecipientEmail);
      console.log("📧 Subject: 🎯 New Task Assigned: Test Task Assignment");
    } else {
      console.log("❌ Email failed to send:", assignmentResult.error);
    }
    
  } catch (error) {
    console.error("❌ Error testing email:", error);
  }
}

// Run the test
testRealEmail().then(() => {
  console.log("\n🏁 Real email test completed");
  console.log("📝 Note: Check your Gmail inbox to confirm the email was received");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});