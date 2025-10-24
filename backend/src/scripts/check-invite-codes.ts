import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import WorkspaceModel from "../models/workspace.model";

const checkInviteCodes = async () => {
  console.log("🔍 Checking invite codes in database...");

  try {
    await connectDatabase();

    const workspaces = await WorkspaceModel.find({}).select("name inviteCode owner");
    
    console.log("🏢 Workspaces and their invite codes:");
    workspaces.forEach((workspace, index) => {
      console.log(`${index + 1}. "${workspace.name}"`);
      console.log(`   ID: ${workspace._id}`);
      console.log(`   Invite Code: ${workspace.inviteCode}`);
      console.log(`   Owner: ${workspace.owner}`);
      console.log('---');
    });

    // Test specific invite codes
    const testCodes = ['3577f49b', '29144b98'];
    
    for (const code of testCodes) {
      console.log(`🧪 Testing invite code: ${code}`);
      const workspace = await WorkspaceModel.findOne({ inviteCode: code });
      console.log(`   Found workspace:`, workspace ? { id: workspace._id, name: workspace.name } : 'Not found');
    }

    console.log("🎉 Invite code check completed!");
  } catch (error) {
    console.error("❌ Invite code check failed:", error);
  } finally {
    await mongoose.connection.close();
  }
};

checkInviteCodes().catch((error) =>
  console.error("Error running invite code check:", error)
);