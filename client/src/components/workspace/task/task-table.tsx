import { FC, useState } from "react";
import { getColumns } from "./table/columns";
import { DataTable } from "./table/table";
import { useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";
import { DataTableFacetedFilter } from "./table/table-faceted-filter";
import { DateRangeFilter } from "./table/date-range-filter";
import { priorities, statuses } from "./table/data";
import useTaskTableFilter from "@/hooks/use-task-table-filter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn, bulkDeleteTasksMutationFn } from "@/lib/api";
import API from "@/lib/axios-client";
import { TaskType } from "@/types/api.type";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskDetailModal } from "./task-detail-modal";
import { toast } from "@/hooks/use-toast";

type Filters = ReturnType<typeof useTaskTableFilter>[0];
type SetFilters = ReturnType<typeof useTaskTableFilter>[1];

interface DataTableFilterToolbarProps {
  isLoading?: boolean;
  projectId?: string;
  filters: Filters;
  setFilters: SetFilters;
  selectedTaskIds?: string[];
  onBulkDelete?: () => void;
  totalTasks?: number;
  isBulkDeleting?: boolean;
}

const TaskTable = () => {
  const param = useParams();
  const projectId = param.projectId as string;

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [_isLoadingTaskDetails, setIsLoadingTaskDetails] = useState(false);
  const [rowSelection, setRowSelection] = useState({});

  const [filters, setFilters] = useTaskTableFilter();
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();
  const columns = getColumns(projectId);

  const { data, isLoading } = useQuery({
    queryKey: [
      "all-tasks",
      workspaceId,
      pageSize,
      pageNumber,
      filters,
      projectId,
    ],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        keyword: filters.keyword,
        priority: filters.priority,
        status: filters.status,
        projectId: projectId || filters.projectId,
        assignedTo: filters.assigneeId,
        createdFrom: filters.createdFrom,
        createdTo: filters.createdTo,
        dueFrom: filters.dueFrom,
        dueTo: filters.dueTo,
        pageNumber,
        pageSize,
      }),
    staleTime: 0,
  });

  const tasks: TaskType[] = data?.tasks || [];
  const totalCount = data?.pagination.totalCount || 0;

  const handlePageChange = (page: number) => {
    setPageNumber(page);
  };

  // Handle page size changes
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };

  // Handle task click
  const handleTaskClick = async (task: TaskType) => {
    setIsLoadingTaskDetails(true);
    try {
      // Fetch complete task details
      const response = await API.get(
        `task/${task._id}/project/${task.project._id}/workspace/${workspaceId}`
      );
      const fullTask = response.data.task;
      setSelectedTask(fullTask);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch task details:", error);
      // Fallback to using the task from the table
      setSelectedTask(task);
      setIsModalOpen(true);
    } finally {
      setIsLoadingTaskDetails(false);
    }
  };

  // Handle task update
  const updateTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: any;
    }) => {
      const response = await API.put(
        `task/${taskId}/project/${selectedTask?.project._id}/workspace/${workspaceId}/update`,
        updates
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
      // Update the selected task with new data
      if (selectedTask) {
        setSelectedTask({ ...selectedTask, ...variables.updates });
      }
    },
    onError: (_error) => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: (taskIds: string[]) =>
      bulkDeleteTasksMutationFn({ workspaceId, taskIds }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["all-tasks"] });
      setRowSelection({});
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete tasks",
        variant: "destructive",
      });
    },
  });

  // Get selected task IDs from row selection
  const selectedTaskIds = Object.keys(rowSelection)
    .filter((key) => rowSelection[key as keyof typeof rowSelection])
    .map((index) => tasks[parseInt(index)]?._id)
    .filter(Boolean);

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedTaskIds.length === 0) return;
    bulkDeleteMutation.mutate(selectedTaskIds);
  };

  return (
    <div className="w-full relative">
      <DataTable
        isLoading={isLoading}
        data={tasks}
        columns={columns}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pagination={{
          totalCount,
          pageNumber,
          pageSize,
        }}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        filtersToolbar={
          <DataTableFilterToolbar
            isLoading={isLoading}
            projectId={projectId}
            filters={filters}
            setFilters={setFilters}
            selectedTaskIds={selectedTaskIds}
            onBulkDelete={handleBulkDelete}
            totalTasks={tasks.length}
            isBulkDeleting={bulkDeleteMutation.isPending}
          />
        }
        meta={{
          onTaskClick: handleTaskClick,
        }}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onUpdateTask={(taskId, updates) => {
          updateTaskMutation.mutate({ taskId, updates });
        }}
      />
    </div>
  );
};

const DataTableFilterToolbar: FC<DataTableFilterToolbarProps> = ({
  isLoading,
  projectId,
  filters,
  setFilters,
  selectedTaskIds = [],
  onBulkDelete,
  isBulkDeleting = false,
}) => {
  const workspaceId = useWorkspaceId();

  const { data } = useGetProjectsInWorkspaceQuery({
    workspaceId,
  });

  const { data: memberData } = useGetWorkspaceMembers(workspaceId);

  const projects = data?.projects || [];
  const members = memberData?.members || [];

  //Workspace Projects
  const projectOptions = projects?.map((project) => {
    return {
      label: (
        <div className="flex items-center gap-1">
          <span>{project.emoji}</span>
          <span>{project.name}</span>
        </div>
      ),
      value: project._id,
    };
  });

  // Workspace Memebers
  const assigneesOptions = members?.map((member) => {
    const name = member.userId?.name || "Unknown";
    const initials = getAvatarFallbackText(name);
    const avatarColor = getAvatarColor(name);

    return {
      label: (
        <div className="flex items-center space-x-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={member.userId?.profilePicture || ""} alt={name} />
            <AvatarFallback className={avatarColor}>{initials}</AvatarFallback>
          </Avatar>
          <span>{name}</span>
        </div>
      ),
      value: member.userId._id,
    };
  });

  const handleFilterChange = (key: keyof Filters, values: string[]) => {
    setFilters({
      ...filters,
      [key]: values.length > 0 ? values.join(",") : null,
    });
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedTaskIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              {selectedTaskIds.length} task(s) selected
            </span>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            disabled={isBulkDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isBulkDeleting ? "Deleting..." : "Delete Selected"}
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row w-full items-start space-y-2 mb-2 lg:mb-0 lg:space-x-2  lg:space-y-0">
        <Input
          placeholder="Filter tasks..."
          value={filters.keyword || ""}
          onChange={(e) =>
            setFilters({
              keyword: e.target.value,
            })
          }
          className="h-8 w-full lg:w-[250px]"
        />
        {/* Status filter */}
        <DataTableFacetedFilter
          title="Status"
          multiSelect={true}
          options={statuses}
          disabled={isLoading}
          selectedValues={filters.status?.split(",") || []}
          onFilterChange={(values) => handleFilterChange("status", values)}
        />

        {/* Priority filter */}
        <DataTableFacetedFilter
          title="Priority"
          multiSelect={true}
          options={priorities}
          disabled={isLoading}
          selectedValues={filters.priority?.split(",") || []}
          onFilterChange={(values) => handleFilterChange("priority", values)}
        />

        {/* Assigned To filter */}
        <DataTableFacetedFilter
          title="Assigned To"
          multiSelect={true}
          options={assigneesOptions}
          disabled={isLoading}
          selectedValues={filters.assigneeId?.split(",") || []}
          onFilterChange={(values) => handleFilterChange("assigneeId", values)}
        />

        {!projectId && (
          <DataTableFacetedFilter
            title="Projects"
            multiSelect={false}
            options={projectOptions}
            disabled={isLoading}
            selectedValues={filters.projectId?.split(",") || []}
            onFilterChange={(values) => handleFilterChange("projectId", values)}
          />
        )}

        {/* Date Range Filters - Can be used simultaneously */}
        <div className="flex flex-wrap gap-2">
          <DateRangeFilter
            title="Created Date"
            fromValue={filters.createdFrom || undefined}
            toValue={filters.createdTo || undefined}
            onFromChange={(value) => setFilters({ createdFrom: value })}
            onToChange={(value) => setFilters({ createdTo: value })}
          />

          <DateRangeFilter
            title="Due Date"
            fromValue={filters.dueFrom || undefined}
            toValue={filters.dueTo || undefined}
            onFromChange={(value) => setFilters({ dueFrom: value })}
            onToChange={(value) => setFilters({ dueTo: value })}
          />
        </div>

        {Object.values(filters).some(
          (value) => value !== null && value !== ""
        ) && (
          <Button
            disabled={isLoading}
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={() =>
              setFilters({
                keyword: null,
                status: null,
                priority: null,
                projectId: null,
                assigneeId: null,
                createdFrom: null,
                createdTo: null,
                dueFrom: null,
                dueTo: null,
              })
            }
          >
            Reset
            <X />
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskTable;
