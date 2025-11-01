import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { uploadMediaToCloudinary } from "../services/media.service";
import { BadRequestException } from "../utils/appError";
import fs from 'fs';

export const uploadMediaController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestException("No file uploaded");
    }

    try {
      // Upload to Cloudinary
      const uploadResult = await uploadMediaToCloudinary(req.file);

      // Clean up temporary file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(HTTPSTATUS.OK).json({
        message: "File uploaded successfully",
        data: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          type: uploadResult.resourceType,
          filename: req.file.originalname,
          size: uploadResult.bytes,
        },
      });
    } catch (error) {
      // Clean up temporary file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      throw error;
    }
  }
);