import mongoose from "mongoose";
import UserModel from "../models/user.model";
import AccountModel from "../models/account.model";
import WorkspaceModel from "../models/workspace.model";
import RoleModel from "../models/roles-permission.model";
import { Roles } from "../enums/role.enum";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../utils/appError";
import MemberModel from "../models/member.model";
import { ProviderEnum } from "../enums/account-provider.enum";

// Helper function to create user's own workspace
const createOwnWorkspace = async (user: any, session: any) => {
  const workspace = new WorkspaceModel({
    name: `My Workspace`,
    description: `Workspace created for ${user.name}`,
    owner: user._id,
  });
  await workspace.save({ session });

  const ownerRole = await RoleModel.findOne({
    name: Roles.OWNER,
  }).session(session);

  if (!ownerRole) {
    throw new NotFoundException("Owner role not found");
  }

  const member = new MemberModel({
    userId: user._id,
    workspaceId: workspace._id,
    role: ownerRole._id,
    joinedAt: new Date(),
  });
  await member.save({ session });

  user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
  await user.save({ session });
  
  console.log('✅ User created as OWNER of new workspace');
};

export const loginOrCreateAccountService = async (data: {
  provider: string;
  displayName: string;
  providerId: string;
  picture?: string;
  email?: string;
  inviteCode?: string;
}) => {
  const { providerId, provider, displayName, email, picture, inviteCode } = data;
  
  console.log('🔍 OAuth login/create account started');
  console.log('📧 Email:', email);
  console.log('👤 Name:', displayName);
  console.log('🎫 Invite code:', inviteCode || 'None provided');

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    console.log("Started Session...");

    let user = await UserModel.findOne({ email }).session(session);

    if (!user) {
      // Create a new user if it doesn't exist
      user = new UserModel({
        email,
        name: displayName,
        profilePicture: picture || null,
      });
      await user.save({ session });

      const account = new AccountModel({
        userId: user._id,
        provider: provider,
        providerId: providerId,
      });
      await account.save({ session });

      // Handle invite code or create new workspace
      if (inviteCode) {
        console.log('🎫 Processing invite code in OAuth:', inviteCode);
        // User is signing up via invite - join the invited workspace
        const invitedWorkspace = await WorkspaceModel.findOne({ inviteCode }).session(session);
        console.log('🏢 Invited workspace found:', invitedWorkspace ? { id: invitedWorkspace._id, name: invitedWorkspace.name } : 'Not found');
        
        if (invitedWorkspace) {
          const memberRole = await RoleModel.findOne({
            name: Roles.MEMBER,
          }).session(session);
          
          console.log('👥 Member role found:', memberRole ? { id: memberRole._id, name: memberRole.name } : 'Not found');

          if (memberRole) {
            const member = new MemberModel({
              userId: user._id,
              workspaceId: invitedWorkspace._id,
              role: memberRole._id,
              joinedAt: new Date(),
            });
            await member.save({ session });
            
            console.log('✅ OAuth user added as MEMBER to invited workspace');

            user.currentWorkspace = invitedWorkspace._id as mongoose.Types.ObjectId;
            await user.save({ session });
          } else {
            console.log('❌ Member role not found, creating own workspace');
            // Fallback to creating own workspace
            await createOwnWorkspace(user, session);
          }
        } else {
          console.log('❌ Invited workspace not found, creating own workspace');
          // Fallback to creating own workspace
          await createOwnWorkspace(user, session);
        }
      } else {
        console.log('🏗️ No invite code in OAuth - creating new workspace for user');
        // Normal signup - create a new workspace for the user
        await createOwnWorkspace(user, session);
      }
    }
    await session.commitTransaction();
    session.endSession();
    console.log("End Session...");

    return { user };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  } finally {
    session.endSession();
  }
};

export const registerUserService = async (body: {
  email: string;
  name: string;
  password: string;
  inviteCode?: string;
}) => {
  const { email, name, password, inviteCode } = body;
  
  console.log('🔍 User registration started');
  console.log('📧 Email:', email);
  console.log('👤 Name:', name);
  console.log('🎫 Invite code:', inviteCode || 'None provided');
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const existingUser = await UserModel.findOne({ email }).session(session);
    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    const user = new UserModel({
      email,
      name,
      password,
    });
    await user.save({ session });

    const account = new AccountModel({
      userId: user._id,
      provider: ProviderEnum.EMAIL,
      providerId: email,
    });
    await account.save({ session });

    let workspaceId: mongoose.Types.ObjectId;

    if (inviteCode) {
      console.log('🎫 Processing invite code:', inviteCode);
      // User is signing up via invite - join the invited workspace
      const invitedWorkspace = await WorkspaceModel.findOne({ inviteCode }).session(session);
      console.log('🏢 Invited workspace found:', invitedWorkspace ? { id: invitedWorkspace._id, name: invitedWorkspace.name } : 'Not found');
      
      if (!invitedWorkspace) {
        throw new NotFoundException("Invalid invite code or workspace not found");
      }

      const memberRole = await RoleModel.findOne({
        name: Roles.MEMBER,
      }).session(session);
      
      console.log('👥 Member role found:', memberRole ? { id: memberRole._id, name: memberRole.name } : 'Not found');

      if (!memberRole) {
        throw new NotFoundException("Member role not found");
      }

      const member = new MemberModel({
        userId: user._id,
        workspaceId: invitedWorkspace._id,
        role: memberRole._id,
        joinedAt: new Date(),
      });
      await member.save({ session });
      
      console.log('✅ User added as MEMBER to invited workspace');

      user.currentWorkspace = invitedWorkspace._id as mongoose.Types.ObjectId;
      workspaceId = invitedWorkspace._id as mongoose.Types.ObjectId;
    } else {
      console.log('🏗️ No invite code - creating new workspace for user');
      // Normal signup - create a new workspace for the user
      const workspace = new WorkspaceModel({
        name: `My Workspace`,
        description: `Workspace created for ${user.name}`,
        owner: user._id,
      });
      await workspace.save({ session });

      const ownerRole = await RoleModel.findOne({
        name: Roles.OWNER,
      }).session(session);

      if (!ownerRole) {
        throw new NotFoundException("Owner role not found");
      }

      const member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
      });
      await member.save({ session });

      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
      workspaceId = workspace._id as mongoose.Types.ObjectId;
      
      console.log('✅ User created as OWNER of new workspace');
    }

    await user.save({ session });

    await session.commitTransaction();
    session.endSession();
    console.log("End Session...");

    return {
      userId: user._id,
      workspaceId: workspaceId,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw error;
  }
};

export const verifyUserService = async ({
  email,
  password,
  provider = ProviderEnum.EMAIL,
}: {
  email: string;
  password: string;
  provider?: string;
}) => {
  const account = await AccountModel.findOne({ provider, providerId: email });
  if (!account) {
    throw new NotFoundException("Invalid email or password");
  }

  const user = await UserModel.findById(account.userId);

  if (!user) {
    throw new NotFoundException("User not found for the given account");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedException("Invalid email or password");
  }

  return user.omitPassword();
};
