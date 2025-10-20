import API from "./axios-client";
import {
  AllMembersInWorkspaceResponseType,
  AllProjectPayloadType,
  AllProjectResponseType,
  AllTaskPayloadType,
  AllTaskResponseType,
  AnalyticsResponseType,
  ChangeWorkspaceMemberRoleType,
  CreateProjectPayloadType,
  CreateTaskPayloadType,
  EditTaskPayloadType,
  CreateWorkspaceResponseType,
  EditProjectPayloadType,
  ProjectByIdPayloadType,
  ProjectResponseType,
} from "../types/api.type";
import {
  AllWorkspaceResponseType,
  CreateWorkspaceType,
  CurrentUserResponseType,
  LoginResponseType,
  loginType,
  registerType,
  WorkspaceByIdResponseType,
  EditWorkspaceType,
} from "@/types/api.type";

export const loginMutationFn = async (
  data: loginType
): Promise<LoginResponseType> => {
  const response = await API.post("/auth/login", data);
  return response.data;
};

export const registerMutationFn = async (data: registerType) =>
  await API.post("/auth/register", data);

export const logoutMutationFn = async () => await API.post("/auth/logout");

export const getCurrentUserQueryFn =
  async (): Promise<CurrentUserResponseType> => {
    const response = await API.get(`/user/current`);
    return response.data;
  };

//********* WORKSPACE ****************
//************* */

export const createWorkspaceMutationFn = async (
  data: CreateWorkspaceType
): Promise<CreateWorkspaceResponseType> => {
  const response = await API.post(`/workspace/create/new`, data);
  return response.data;
};

export const editWorkspaceMutationFn = async ({
  workspaceId,
  data,
}: EditWorkspaceType) => {
  const response = await API.put(`/workspace/update/${workspaceId}`, data);
  return response.data;
};

export const getAllWorkspacesUserIsMemberQueryFn =
  async (): Promise<AllWorkspaceResponseType> => {
    const response = await API.get(`/workspace/all`);
    return response.data;
  };

export const getWorkspaceByIdQueryFn = async (
  workspaceId: string
): Promise<WorkspaceByIdResponseType> => {
  const response = await API.get(`/workspace/${workspaceId}`);
  return response.data;
};

export const getMembersInWorkspaceQueryFn = async (
  workspaceId: string
): Promise<AllMembersInWorkspaceResponseType> => {
  const response = await API.get(`/workspace/members/${workspaceId}`);
  return response.data;
};

export const getWorkspaceAnalyticsQueryFn = async (
  workspaceId: string
): Promise<AnalyticsResponseType> => {
  const response = await API.get(`/workspace/analytics/${workspaceId}`);
  return response.data;
};

export const changeWorkspaceMemberRoleMutationFn = async ({
  workspaceId,
  data,
}: ChangeWorkspaceMemberRoleType) => {
  const response = await API.put(
    `/workspace/change/member/role/${workspaceId}`,
    data
  );
  return response.data;
};

export const deleteWorkspaceMutationFn = async (
  workspaceId: string
): Promise<{
  message: string;
  currentWorkspace: string;
}> => {
  const response = await API.delete(`/workspace/delete/${workspaceId}`);
  return response.data;
};

//*******MEMBER ****************

export const invitedUserJoinWorkspaceMutationFn = async (
  iniviteCode: string
): Promise<{
  message: string;
  workspaceId: string;
}> => {
  const response = await API.post(`/member/workspace/${iniviteCode}/join`);
  return response.data;
};

//********* */
//********* PROJECTS
export const createProjectMutationFn = async ({
  workspaceId,
  data,
}: CreateProjectPayloadType): Promise<ProjectResponseType> => {
  const response = await API.post(
    `/project/workspace/${workspaceId}/create`,
    data
  );
  return response.data;
};

export const editProjectMutationFn = async ({
  projectId,
  workspaceId,
  data,
}: EditProjectPayloadType): Promise<ProjectResponseType> => {
  const response = await API.put(
    `/project/${projectId}/workspace/${workspaceId}/update`,
    data
  );
  return response.data;
};

export const getProjectsInWorkspaceQueryFn = async ({
  workspaceId,
  pageSize = 10,
  pageNumber = 1,
}: AllProjectPayloadType): Promise<AllProjectResponseType> => {
  const response = await API.get(
    `/project/workspace/${workspaceId}/all?pageSize=${pageSize}&pageNumber=${pageNumber}`
  );
  return response.data;
};

export const getProjectByIdQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<ProjectResponseType> => {
  const response = await API.get(
    `/project/${projectId}/workspace/${workspaceId}`
  );
  return response.data;
};

export const getProjectAnalyticsQueryFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<AnalyticsResponseType> => {
  const response = await API.get(
    `/project/${projectId}/workspace/${workspaceId}/analytics`
  );
  return response.data;
};

export const deleteProjectMutationFn = async ({
  workspaceId,
  projectId,
}: ProjectByIdPayloadType): Promise<{
  message: string;
}> => {
  const response = await API.delete(
    `/project/${projectId}/workspace/${workspaceId}/delete`
  );
  return response.data;
};

//*******TASKS ********************************
//************************* */

export const createTaskMutationFn = async ({
  workspaceId,
  projectId,
  data,
}: CreateTaskPayloadType) => {
  const response = await API.post(
    `/task/project/${projectId}/workspace/${workspaceId}/create`,
    data
  );
  return response.data;
};


export const editTaskMutationFn = async ({
  taskId,
  projectId,
  workspaceId,
  data,
}: EditTaskPayloadType): Promise<{message: string;}> => {
  const response = await API.put(
    `/task/${taskId}/project/${projectId}/workspace/${workspaceId}/update/`,
    data
  );
  return response.data;
};

export const getAllTasksQueryFn = async ({
  workspaceId,
  keyword,
  projectId,
  assignedTo,
  priority,
  status,
  dueDate,
  pageNumber,
  pageSize,
}: AllTaskPayloadType): Promise<AllTaskResponseType> => {
  const baseUrl = `/task/workspace/${workspaceId}/all`;

  const queryParams = new URLSearchParams();
  if (keyword) queryParams.append("keyword", keyword);
  if (projectId) queryParams.append("projectId", projectId);
  if (assignedTo) queryParams.append("assignedTo", assignedTo);
  if (priority) queryParams.append("priority", priority);
  if (status) queryParams.append("status", status);
  if (dueDate) queryParams.append("dueDate", dueDate);
  if (pageNumber) queryParams.append("pageNumber", pageNumber?.toString());
  if (pageSize) queryParams.append("pageSize", pageSize?.toString());

  const url = queryParams.toString() ? `${baseUrl}?${queryParams}` : baseUrl;
  const response = await API.get(url);
  return response.data;
};

export const deleteTaskMutationFn = async ({
  workspaceId,
  taskId,
}: {
  workspaceId: string;
  taskId: string;
}): Promise<{
  message: string;
}> => {
  const response = await API.delete(
    `task/${taskId}/workspace/${workspaceId}/delete`
  );
  return response.data;
};

//********* COMMENTS ****************
//************* */

export const getTaskCommentsQueryFn = async (
  workspaceId: string,
  taskId: string
): Promise<{
  message: string;
  comments: any[];
}> => {
  const response = await API.get(`comment/workspace/${workspaceId}/task/${taskId}`);
  return response.data;
};

export const createCommentMutationFn = async ({
  workspaceId,
  taskId,
  content,
}: {
  workspaceId: string;
  taskId: string;
  content: string;
}): Promise<{
  message: string;
  comment: any;
}> => {
  const response = await API.post(`comment/workspace/${workspaceId}/task/${taskId}`, {
    content,
  });
  return response.data;
};

export const updateCommentMutationFn = async ({
  workspaceId,
  taskId,
  commentId,
  content,
}: {
  workspaceId: string;
  taskId: string;
  commentId: string;
  content: string;
}): Promise<{
  message: string;
  comment: any;
}> => {
  const response = await API.put(
    `comment/${commentId}/workspace/${workspaceId}/task/${taskId}`,
    { content }
  );
  return response.data;
};

export const deleteCommentMutationFn = async ({
  workspaceId,
  taskId,
  commentId,
}: {
  workspaceId: string;
  taskId: string;
  commentId: string;
}): Promise<{
  message: string;
}> => {
  const response = await API.delete(
    `comment/${commentId}/workspace/${workspaceId}/task/${taskId}`
  );
  return response.data;
};

//********* ACTIVITIES ****************
//************* */

export const getTaskActivitiesQueryFn = async (
  workspaceId: string,
  taskId: string
): Promise<{
  message: string;
  activities: any[];
}> => {
  const response = await API.get(`activity/workspace/${workspaceId}/task/${taskId}`);
  return response.data;
};
//********* STICKIES ****************
//************* */

export const getStickiesQueryFn = async ({
  workspaceId,
  type,
  projectId,
  taskId,
}: {
  workspaceId: string;
  type?: string;
  projectId?: string;
  taskId?: string;
}): Promise<any[]> => {
  const queryParams = new URLSearchParams();
  if (type) queryParams.append("type", type);
  if (projectId) queryParams.append("projectId", projectId);
  if (taskId) queryParams.append("taskId", taskId);

  const url = queryParams.toString() 
    ? `/sticky/workspace/${workspaceId}?${queryParams}` 
    : `/sticky/workspace/${workspaceId}`;
  
  const response = await API.get(url);
  return response.data.data;
};

export const createStickyMutationFn = async ({
  workspaceId,
  data,
}: {
  workspaceId: string;
  data: {
    title: string;
    content: string;
    type: "project" | "task" | "scribble";
    project?: string;
    task?: string;
    color?: string;
  };
}): Promise<{
  message: string;
  data: any;
}> => {
  const response = await API.post(`/sticky/workspace/${workspaceId}`, data);
  return response.data;
};

export const updateStickyMutationFn = async ({
  workspaceId,
  stickyId,
  data,
}: {
  workspaceId: string;
  stickyId: string;
  data: {
    title?: string;
    content?: string;
    color?: string;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
  };
}): Promise<{
  message: string;
  data: any;
}> => {
  const response = await API.put(`/sticky/workspace/${workspaceId}/${stickyId}`, data);
  return response.data;
};

export const deleteStickyMutationFn = async ({
  workspaceId,
  stickyId,
}: {
  workspaceId: string;
  stickyId: string;
}): Promise<{
  message: string;
}> => {
  const response = await API.delete(`/sticky/workspace/${workspaceId}/${stickyId}`);
  return response.data;
};

export const getStickyByIdQueryFn = async ({
  workspaceId,
  stickyId,
}: {
  workspaceId: string;
  stickyId: string;
}): Promise<{
  data: any;
}> => {
  const response = await API.get(`/sticky/workspace/${workspaceId}/${stickyId}`);
  return response.data;
};