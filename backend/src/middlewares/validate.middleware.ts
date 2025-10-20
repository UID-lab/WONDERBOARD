import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { HTTPSTATUS } from "../config/http.config";

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(HTTPSTATUS.BAD_REQUEST).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  
  next();
};