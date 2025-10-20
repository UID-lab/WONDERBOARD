import { Router } from "express";
import {
  createStickyController,
  getStickiesController,
  updateStickyController,
  deleteStickyController,
  getStickyByIdController,
} from "../controllers/sticky.controller";

const router = Router();

// Create sticky
router.post("/workspace/:workspaceId", createStickyController);

// Get stickies by workspace
router.get("/workspace/:workspaceId", getStickiesController);

// Get sticky by ID
router.get("/workspace/:workspaceId/:stickyId", getStickyByIdController);

// Update sticky
router.put("/workspace/:workspaceId/:stickyId", updateStickyController);

// Delete sticky
router.delete("/workspace/:workspaceId/:stickyId", deleteStickyController);

export default router;