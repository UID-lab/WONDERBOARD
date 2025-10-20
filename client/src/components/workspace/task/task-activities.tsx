import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { format } from "date-fns";
import useWorkspaceId from "@/hooks/use-workspace-id";
import {
  FileText,
  MessageCircle,
  Edit,
  Trash2,
  UserPlus,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

import { getTaskActivitiesQueryFn } from "@/lib/api";

interface Activity {
  _id: string;
  type: string;
  description: string;
  user: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  metadata?: any;
  createdAt: string;
}

interface TaskActivitiesProps {
  taskId: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "TASK_CREATED":
      return <FileText className="h-4 w-4 text-green-500" />;
    case "TASK_UPDATED":
      return <Edit className="h-4 w-4 text-blue-500" />;
    case "TASK_DELETED":
      return <Trash2 className="h-4 w-4 text-red-500" />;
    case "COMMENT_ADDED":
      return <MessageCircle className="h-4 w-4 text-purple-500" />;
    case "COMMENT_UPDATED":
      return <Edit className="h-4 w-4 text-purple-400" />;
    case "COMMENT_DELETED":
      return <Trash2 className="h-4 w-4 text-purple-300" />;
    case "TASK_ASSIGNED":
      return <UserPlus className="h-4 w-4 text-orange-500" />;
    case "TASK_STATUS_CHANGED":
      return <BarChart3 className="h-4 w-4 text-indigo-500" />;
    case "TASK_PRIORITY_CHANGED":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    default:
      return <FileText className="h-4 w-4 text-gray-500" />;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "TASK_CREATED":
      return "border-green-200 bg-green-50";
    case "TASK_UPDATED":
      return "border-blue-200 bg-blue-50";
    case "TASK_DELETED":
      return "border-red-200 bg-red-50";
    case "COMMENT_ADDED":
    case "COMMENT_UPDATED":
    case "COMMENT_DELETED":
      return "border-purple-200 bg-purple-50";
    case "TASK_ASSIGNED":
      return "border-orange-200 bg-orange-50";
    case "TASK_STATUS_CHANGED":
      return "border-indigo-200 bg-indigo-50";
    case "TASK_PRIORITY_CHANGED":
      return "border-yellow-200 bg-yellow-50";
    default:
      return "border-gray-200 bg-gray-50";
  }
};

export const TaskActivities = ({ taskId }: TaskActivitiesProps) => {
  const workspaceId = useWorkspaceId();

  const { data, isLoading } = useQuery({
    queryKey: ["task-activities", workspaceId, taskId],
    queryFn: () => getTaskActivitiesQueryFn(workspaceId, taskId),
    enabled: !!workspaceId && !!taskId,
  });

  const activities: Activity[] = data?.activities || [];

  if (isLoading) {
    return <div className="text-center py-4">Loading activities...</div>;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activities yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const userName = activity.user.name;
        const userInitials = getAvatarFallbackText(userName);
        const userAvatarColor = getAvatarColor(userName);
        const activityIcon = getActivityIcon(activity.type);
        const activityColor = getActivityColor(activity.type);

        return (
          <Card key={activity._id} className={`p-4 ${activityColor}`}>
            <div className="flex gap-3">
              <div className="flex-shrink-0 relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={activity.user.profilePicture || ""}
                    alt={userName}
                  />
                  <AvatarFallback className={userAvatarColor}>
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border">
                  {activityIcon}
                </div>
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{userName}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(activity.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>

                <div className="text-sm text-gray-700">
                  {activity.description}
                </div>

                {/* Show additional metadata for certain activity types */}
                {activity.metadata && activity.type === "TASK_UPDATED" && (
                  <div className="mt-2 p-2 bg-white/50 rounded text-xs text-gray-600">
                    <div className="font-medium mb-1">Changes made:</div>
                    <ul className="list-disc list-inside space-y-0.5">
                      {activity.metadata.changes?.map((change: string, idx: number) => (
                        <li key={idx}>{change}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Timeline connector */}
              {index < activities.length - 1 && (
                <div className="absolute left-[52px] mt-10 w-px h-6 bg-gray-200" />
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};