import dotenv from "dotenv";
import { sendTaskAssignmentEmail } from "../services/email.service";

// Load environment variables
dotenv.config();

async function demonstrateEmailFlow() {
  console.log("🎯 Demonstrating Email Flow:");
  console.log("📤 FROM: gilbertstanley311@gmail.com");
  console.log("📥 TO: [assigned user's email]");
  console.log("=" .repeat(50));
  
  // Example scenario: John assigns a task to Sarah
  const assignerName = "John Smith";
  const assignerEmail = "john.smith@company.com";
  
  const assigneeName = "Sarah Johnson"; 
  const assigneeEmail = "sarah.johnson@company.com"; // This would come from user database
  
  const taskTitle = "Update user dashboard";
  const taskDescription = "Please update the user dashboard with the new analytics widgets and improve the responsive design.";
  
  console.log("\n📋 Task Assignment Scenario:");
  console.log(`👤 Assigner: ${assignerName} (${assignerEmail})`);
  console.log(`👤 Assignee: ${assigneeName} (${assigneeEmail})`);
  console.log(`📝 Task: ${taskTitle}`);
  
  console.log("\n📧 Sending email...");
  console.log(`📤 Email will be sent FROM: gilbertstanley311@gmail.com`);
  console.log(`📥 Email will be sent TO: ${assigneeEmail}`);
  
  try {
    const result = await sendTaskAssignmentEmail(
      assigneeEmail,        // TO: assigned user's email
      assigneeName,         // assigned user's name
      taskTitle,           // task title
      taskDescription,     // task description  
      assignerName,        // who assigned it
      assignerEmail,       // assigner's email (for display only)
      "workspace-123",     // workspace ID
      "task-456"          // task ID
    );
    
    if (result.success) {
      console.log("\n✅ EMAIL SENT SUCCESSFULLY!");
      console.log("📧 Email Details:");
      console.log(`   FROM: "Wonder Board - ${assignerName}" <gilbertstanley311@gmail.com>`);
      console.log(`   TO: ${assigneeEmail}`);
      console.log(`   SUBJECT: 🎯 New Task Assigned: ${taskTitle}`);
      console.log(`   MESSAGE ID: ${result.messageId}`);
      
      console.log("\n🎉 The assigned user will receive:");
      console.log("   ✉️  A beautiful HTML email");
      console.log("   🎨 With fancy gradients and styling");
      console.log("   📋 Containing task details");
      console.log("   🔗 With a link to the workspace");
      console.log("   👤 Showing who assigned the task");
      
    } else {
      console.log("❌ Email failed:", result.error);
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the demonstration
demonstrateEmailFlow().then(() => {
  console.log("\n" + "=".repeat(50));
  console.log("🏁 Email flow demonstration completed");
  console.log("📝 This is exactly how emails work in your app:");
  console.log("   1. User assigns task to another user");
  console.log("   2. System gets assignee's email from database");
  console.log("   3. Email sent FROM gilbertstanley311@gmail.com");
  console.log("   4. Email delivered TO assignee's inbox");
  process.exit(0);
}).catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});