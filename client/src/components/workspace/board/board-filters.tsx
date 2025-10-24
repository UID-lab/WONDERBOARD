import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { DataTableFacetedFilter } from "../task/table/table-faceted-filter";
import { DateRangeFilter } from "../task/table/date-range-filter";
import { priorities, statuses } from "../task/table/data";
import useGetProjectsInWorkspaceQuery from "@/hooks/api/use-get-projects";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import useTaskTableFilter from "@/hooks/use-task-table-filter";

type Filters = ReturnType<typeof useTaskTableFilter>[0];
type SetFilters = ReturnType<typeof useTaskTableFilter>[1];

interface BoardFiltersProps {
  filters: Filters;
  setFilters: SetFilters;
}

const BoardFilters = ({ filters, setFilters }: BoardFiltersProps) => {
  const workspaceId = useWorkspaceId();
  const { data: projectsData } = useGetProjectsInWorkspaceQuery({
    workspaceId,
    pageSize: 100,
    pageNumber: 1,
  });
  const { data: membersData } = useGetWorkspaceMembers(workspaceId);

  const projects = projectsData?.projects || [];
  const members = membersData?.members || [];

  // Transform projects for filter
  const projectOptions = projects.map((project) => ({
    label: `${project.emoji} ${project.name}`,
    value: project._id,
    icon: () => <span className="mr-2">{project.emoji}</span>,
  }));

  // Transform members for filter
  const memberOptions = members.map((member) => {
    const user = member.userId;
    return {
      label: user.name,
      value: user._id,
      icon: () => (
        <Avatar className="h-4 w-4 mr-2">
          <AvatarImage src={user.profilePicture || ""} alt={user.name} />
          <AvatarFallback className={`text-xs ${getAvatarColor(user.name)}`}>
            {getAvatarFallbackText(user.name)}
          </AvatarFallback>
        </Avatar>
      ),
    };
  });

  const isFiltered = Object.values(filters).some((value) => value !== null && value !== "");

  const resetFilters = () => {
    setFilters({
      keyword: null,
      projectId: null,
      assigneeId: null,
      priority: null,
      status: null,
      createdFrom: null,
      createdTo: null,
      dueFrom: null,
      dueTo: null,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border">
      {/* Search Input */}
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search tasks..."
          value={filters.keyword || ""}
          onChange={(e) => setFilters({ keyword: e.target.value || null })}
          className="h-9"
        />
      </div>

      {/* Status Filter */}
      <DataTableFacetedFilter
        title="Status"
        options={statuses}
        selectedValues={filters.status ? [filters.status] : []}
        onFilterChange={(values) =>
          setFilters({ status: values.length > 0 ? values[0] as any : null })
        }
      />

      {/* Priority Filter */}
      <DataTableFacetedFilter
        title="Priority"
        options={priorities}
        selectedValues={filters.priority ? [filters.priority] : []}
        onFilterChange={(values) =>
          setFilters({ priority: values.length > 0 ? values[0] as any : null })
        }
      />

      {/* Project Filter */}
      {projectOptions.length > 0 && (
        <DataTableFacetedFilter
          title="Project"
          options={projectOptions}
          selectedValues={filters.projectId ? [filters.projectId] : []}
          onFilterChange={(values) =>
            setFilters({ projectId: values.length > 0 ? values[0] : null })
          }
        />
      )}

      {/* Assignee Filter */}
      {memberOptions.length > 0 && (
        <DataTableFacetedFilter
          title="Assigned to"
          options={memberOptions}
          selectedValues={filters.assigneeId ? [filters.assigneeId] : []}
          onFilterChange={(values) =>
            setFilters({ assigneeId: values.length > 0 ? values[0] : null })
          }
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

      {/* Reset Filters */}
      {isFiltered && (
        <Button
          variant="ghost"
          onClick={resetFilters}
          className="h-9 px-2 lg:px-3"
        >
          Reset
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default BoardFilters;