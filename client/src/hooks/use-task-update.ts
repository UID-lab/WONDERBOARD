import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editTaskMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export const useTaskUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editTaskMutationFn,
    onSuccess: () => {
      // Invalidate all task-related queries to ensure consistency across modules
      queryClient.invalidateQueries({ queryKey: ["board-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Task update error:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });
};