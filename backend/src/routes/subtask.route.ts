import { Router } from "express";
import { SubtaskController } from "../controllers/subtask.controller";

const router = Router();

// Create subtask
router.post("/", SubtaskController.createSubtask);

// Get subtasks by task
router.get("/task/:taskId", SubtaskController.getSubtasksByTask);

// Update subtask
router.put("/:subtaskId", SubtaskController.updateSubtask);

// Delete subtask
router.delete("/:subtaskId", SubtaskController.deleteSubtask);

// Reorder subtasks
router.put("/task/:taskId/reorder", SubtaskController.reorderSubtasks);

export default router;