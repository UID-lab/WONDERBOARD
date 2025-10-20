import { Router } from "express";
import { ChecklistController } from "../controllers/checklist.controller";

const router = Router();

// Create checklist
router.post("/", ChecklistController.createChecklist);

// Get checklists by task
router.get("/task/:taskId", ChecklistController.getChecklistsByTask);

// Update checklist
router.put("/:checklistId", ChecklistController.updateChecklist);

// Delete checklist
router.delete("/:checklistId", ChecklistController.deleteChecklist);

// Add checklist item
router.post("/:checklistId/items", ChecklistController.addChecklistItem);

// Update checklist item
router.put("/:checklistId/items/:itemId", ChecklistController.updateChecklistItem);

// Delete checklist item
router.delete("/:checklistId/items/:itemId", ChecklistController.deleteChecklistItem);

export default router;