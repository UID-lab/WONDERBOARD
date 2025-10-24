import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import UserModel from "../models/user.model";
import { sendTaskAssignmentEmail } from "../services/email.service";

const testSpecificEmail = async () => {
  console.log("🧪 Testing email with your specific user IDs...");

  try {
    await connectDatabase();

    const assigneeId = "68fb3b6d5eb92e3a57ded5c9";
    const creatorId = "68f8b43df6f345a0dcfe92cf";
    const workspaceId = "68f8b4cdf6f345a0dcfe92fe";

    console.log("🔍 Looking up users...");
    const assignee = await UserModel.findById(assigneeId);
    const creator = await UserModel.findById(creatorId);

    console.log("👤 Assignee found:", assignee ? { 
      id: assignee._id, 
      name: assignee.name, 
      email: assignee.email 
    } : 'Not found');
    
    console.log("👤 Creator found:", creator ? { 
      id: creator._id, 
      name: creator.name, 
      email: creator.email 
    } : 'Not found');

    if (assignee && creator) {
      const assigneeIdStr = (assignee._id as any).toString();
      const creatorIdStr = creatorId.toString();
      
      console.log('🔍 Checking if assignee !== creator:', assigneeIdStr, '!==', creatorIdStr, '=', assigneeIdStr !== creatorIdStr);
      
      if (assigneeIdStr !== creatorIdStr) {
        console.log('📧 Sending test email...');
        const result = await sendTaskAssignmentEmail(
          assignee.email,
          assignee.name,
          "Testing Mail",
          "This is for MoEngage",
          creator.name,
          creator.email,
          workspaceId,
          "68fb55462f04a5eb7f97d56e"
        );
        
        console.log('📧 Email result:', result);
        
        if (result.previewUrl) {
          console.log('🌐 View the email at:', result.previewUrl);
        }
      } else {
        console.log('⏭️ Assignee and creator are the same person - no email sent');
      }
    } else {
      console.log('❌ Could not find one or both users');
    }

    console.log("🎉 Test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await mongoose.connection.close();
  }
};

testSpecificEmail().catch((error) =>
  console.error("Error running specific email test:", error)
);