import { Router } from "express";
import { uploadMediaController } from "../controllers/media.controller";
import { uploadMiddleware } from "../middlewares/upload.middleware";

const mediaRoutes = Router();

// POST /api/media/upload - Upload media files
mediaRoutes.post("/upload", uploadMiddleware.single('file'), uploadMediaController);

export default mediaRoutes;