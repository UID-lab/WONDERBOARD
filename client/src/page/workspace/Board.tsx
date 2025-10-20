import CreateTaskDialog from "@/components/workspace/task/create-task-dialog";
import KanbanBoard from "@/components/workspace/board/kanban-board";

export default function Board() {
  return (
    <div className="w-full h-full flex-col space-y-8 pt-3">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Board</h2>
          <p className="text-muted-foreground">
            Manage your tasks with a visual Kanban board !
          </p>
        </div>
        <CreateTaskDialog />
      </div>
      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
