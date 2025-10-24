import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import UserModel from "../models/user.model";
import { sendTaskAssignmentEmail } from "../services/email.service";

const testEmail = async () => {
  console.log("🧪 Starting email test...");

  try {
    await connectDatabase();

    // Test 1: Basic email service
    console.log("📧 Test 1: Basic email service");
    const result1 = await sendTaskAssignmentEmail(
      "test@example.com",
      "Test User",
      "Test Task Title",
      "Test task description",
      "Test Creator",
      "testcreator@example.com",
      "test-workspace-id",
      "test-task-id"
    );
    console.log("✅ Basic email test result:", result1);

    // Test 2: Find a real user
    console.log("📧 Test 2: Finding real users");
    const users = await UserModel.find({}).limit(5);
    console.log("👥 Found users:", users.map(u => ({ id: u._id, name: u.name, email: u.email })));

    if (users.length >= 2) {
      const user1 = users[0];
      const user2 = users[1];
      
      console.log("📧 Test 3: Email between real users");
      const result2 = await sendTaskAssignmentEmail(
        user2.email,
        user2.name,
        "Real Test Task",
        "This is a test task assignment",
        user1.name,
        user1.email,
        "test-workspace-id",
        "test-task-id"
      );
      console.log("✅ Real user email test result:", result2);
    }

    console.log("🎉 All email tests completed successfully!");
  } catch (error) {
    console.error("❌ Email test failed:", error);
  } finally {
    await mongoose.connection.close();
  }
};

testEmail().catch((error) =>
  console.error("Error running email test:", error)
);