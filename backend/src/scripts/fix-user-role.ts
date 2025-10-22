import "dotenv/config";
import mongoose from "mongoose";
import connectDatabase from "../config/database.config";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import { Roles } from "../enums/role.enum";

const fixUserRole = async () => {
  console.log("Starting user role fix...");

  try {
    await connectDatabase();

    const userId = "68f8bd62f6f345a0dcfe9638";
    const targetWorkspaceId = "68f8b4cdf6f345a0dcfe92fe"; // The workspace they should join as MEMBER

    // Check all roles first
    const allRoles = await RoleModel.find({});
    console.log("All roles:", allRoles.map(r => ({ id: r._id, name: r.name })));

    // Find user's current memberships
    const userMemberships = await MemberModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    });
    
    console.log("User current memberships:", userMemberships.map(m => ({ 
      workspaceId: m.workspaceId, 
      role: m.role 
    })));

    // Find the MEMBER role
    const memberRole = await RoleModel.findOne({ name: Roles.MEMBER });
    if (!memberRole) {
      console.log("Member role not found");
      return;
    }

    console.log("Member role ID:", memberRole._id);

    // Check if user is already a member of the target workspace
    const existingMembership = await MemberModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      workspaceId: new mongoose.Types.ObjectId(targetWorkspaceId),
    });

    if (!existingMembership) {
      // Add user as member to the target workspace
      const newMember = new MemberModel({
        userId: new mongoose.Types.ObjectId(userId),
        workspaceId: new mongoose.Types.ObjectId(targetWorkspaceId),
        role: memberRole._id,
      });
      await newMember.save();
      console.log(`Added user ${userId} as MEMBER to workspace ${targetWorkspaceId}`);
    } else {
      // Update existing membership to MEMBER role
      existingMembership.role = memberRole as any;
      await existingMembership.save();
      console.log(`Updated user ${userId} role to MEMBER in workspace ${targetWorkspaceId}`);
    }

    // Update user's current workspace
    await UserModel.findByIdAndUpdate(userId, {
      currentWorkspace: new mongoose.Types.ObjectId(targetWorkspaceId)
    });

    console.log(`Updated user's current workspace to ${targetWorkspaceId}`);

  } catch (error) {
    console.error("Error fixing user role:", error);
  } finally {
    await mongoose.connection.close();
  }
};

fixUserRole().catch((error) =>
  console.error("Error running fix script:", error)
);