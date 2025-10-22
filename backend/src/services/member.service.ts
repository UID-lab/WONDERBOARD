import mongoose from "mongoose";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import WorkspaceModel from "../models/workspace.model";
import UserModel from "../models/user.model";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError";

export const getMemberRoleInWorkspace = async (
  userId: string,
  workspaceId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const member = await MemberModel.findOne({
    userId,
    workspaceId,
  }).populate("role");

  if (!member) {
    throw new UnauthorizedException(
      "You are not a member of this workspace",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }

  console.log("Member found:", member);
  console.log("Member role:", member.role);
  
  const roleName = member.role?.name;
  console.log("Role name:", roleName);

  if (!roleName) {
    throw new BadRequestException("User role not found or not properly populated");
  }

  return { role: roleName };
};

export const joinWorkspaceByInviteService = async (
  userId: string,
  inviteCode: string
) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // Find workspace by invite code
    const workspace = await WorkspaceModel.findOne({ inviteCode }).session(session);
    if (!workspace) {
      throw new NotFoundException("Invalid invite code or workspace not found");
    }

    // Check if user is already a member
    const existingMember = await MemberModel.findOne({
      userId,
      workspaceId: workspace._id,
    }).session(session);

    if (existingMember) {
      throw new BadRequestException("You are already a member of this workspace");
    }

    const role = await RoleModel.findOne({ name: Roles.MEMBER }).session(session);

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    // Add user to workspace as a member
    const newMember = new MemberModel({
      userId,
      workspaceId: workspace._id,
      role: role._id,
    });
    await newMember.save({ session });

    // Update user's current workspace to the invited workspace
    await UserModel.findByIdAndUpdate(
      userId,
      { currentWorkspace: workspace._id },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return { workspaceId: workspace._id, role: role.name };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};
