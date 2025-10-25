import dotenv from "dotenv";
import {
  sendTaskAssignmentEmail,
  sendTaskReassignmentEmail,
} from "../services/email.service";

// Load environment variables
dotenv.config();

async function testEmailTemplatesWithEthereal() {
  console.log("🧪 Testing email templates with Ethereal (test emails)...");
  console.log(
    "📧 Gmail credentials not configured, using Ethereal test service"
  );

  try {
    // Test task assignment email
    console.log("\n📧 Testing task assignment email...");
    const assignmentResult = await sendTaskAssignmentEmail(
      "john.doe@example.com", // assigneeEmail
      "John Doe", // assigneeName
      "Implement user authentication system", // taskTitle
      "Create a secure login system with JWT tokens, password hashing, and session management. Include forgot password functionality and email verification.", // taskDescription
      "Jane Smith", // assignedBy
      "jane.smith@company.com", // assignedByEmail
      "workspace123", // workspaceId
      "task456" // taskId
    );

    console.log("✅ Assignment email result:", assignmentResult);
    if (assignmentResult.previewUrl) {
      console.log(
        "🔗 Preview assignment email at:",
        assignmentResult.previewUrl
      );
    }

    // Test task reassignment email
    console.log("\n📧 Testing task reassignment email...");
    const reassignmentResult = await sendTaskReassignmentEmail(
      "alice.johnson@example.com", // assigneeEmail
      "Alice Johnson", // assigneeName
      "Fix critical bug in payment processing", // taskTitle
      "There's a critical issue with the payment gateway that's causing transactions to fail. Need immediate attention to resolve this issue.", // taskDescription
      "Bob Wilson", // reassignedBy
      "bob.wilson@company.com", // reassignedByEmail
      "workspace123", // workspaceId
      "task789" // taskId
    );

    console.log("✅ Reassignment email result:", reassignmentResult);
    if (reassignmentResult.previewUrl) {
      console.log(
        "🔗 Preview reassignment email at:",
        reassignmentResult.previewUrl
      );
    }

    console.log("\n🎉 All email templates tested successfully!");
    console.log(
      "📝 Note: These are test emails using Ethereal. To send real emails:"
    );
    console.log("   1. Set up Gmail App Password");
    console.log("   2. Update EMAIL_USER and EMAIL_PASS in .env file");
    console.log("   3. Uncomment the Gmail credentials in .env");
  } catch (error) {
    console.error("❌ Error testing email templates:", error);
  }
}

// Run the test
testEmailTemplatesWithEthereal()
  .then(() => {
    console.log("🏁 Email template testing completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
