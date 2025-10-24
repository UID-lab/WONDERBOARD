import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import { createTaskService } from "../services/task.service";

const testTaskCreation = async () => {
  console.log("🧪 Testing task creation with email...");

  try {
    await connectDatabase();

    const workspaceId = "68f8b4cdf6f345a0dcfe92fe";
    const projectId = "68f8b56cf6f345a0dcfe935c";
    const creatorId = "68f8b43df6f345a0dcfe92cf";
    const assigneeId = "68fb3b6d5eb92e3a57ded5c9";

    console.log("🔄 Creating task with email notification...");
    
    const result = await createTaskService(
      workspaceId,
      projectId,
      creatorId,
      {
        title: "Test Email Task",
        description: "Testing email notification",
        priority: "HIGH",
        status: "TODO",
        assignedTo: assigneeId,
        dueDate: "2025-10-28T18:30:00.000Z"
      }
    );

    console.log("✅ Task created:", {
      id: result.task._id,
      title: result.task.title,
      assignedTo: result.task.assignedTo
    });

    console.log("🎉 Test completed! Check the logs above for email notification details.");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.connection.close();
  }
};

testTaskCreation().catch((error) =>
  console.error("Error running task creation test:", error)
);