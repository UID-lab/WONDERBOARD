import { body, param, query } from "express-validator";

export const createStickyValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
  
  body("content")
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 1, max: 5000 })
    .withMessage("Content must be between 1 and 5000 characters"),
  
  body("type")
    .isIn(["project", "task", "scribble"])
    .withMessage("Type must be one of: project, task, scribble"),
  
  body("project")
    .optional()
    .isMongoId()
    .withMessage("Project must be a valid MongoDB ObjectId"),
  
  body("task")
    .optional()
    .isMongoId()
    .withMessage("Task must be a valid MongoDB ObjectId"),
  
  body("color")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Color must be a valid hex color"),
  
  body("position.x")
    .optional()
    .isNumeric()
    .withMessage("Position x must be a number"),
  
  body("position.y")
    .optional()
    .isNumeric()
    .withMessage("Position y must be a number"),
  
  body("size.width")
    .optional()
    .isNumeric()
    .withMessage("Size width must be a number"),
  
  body("size.height")
    .optional()
    .isNumeric()
    .withMessage("Size height must be a number"),
];

export const updateStickyValidation = [
  param("stickyId")
    .isMongoId()
    .withMessage("Sticky ID must be a valid MongoDB ObjectId"),
  
  body("title")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Title must be between 1 and 100 characters"),
  
  body("content")
    .optional()
    .isLength({ min: 1, max: 5000 })
    .withMessage("Content must be between 1 and 5000 characters"),
  
  body("color")
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage("Color must be a valid hex color"),
  
  body("position.x")
    .optional()
    .isNumeric()
    .withMessage("Position x must be a number"),
  
  body("position.y")
    .optional()
    .isNumeric()
    .withMessage("Position y must be a number"),
  
  body("size.width")
    .optional()
    .isNumeric()
    .withMessage("Size width must be a number"),
  
  body("size.height")
    .optional()
    .isNumeric()
    .withMessage("Size height must be a number"),
];

export const getStickyValidation = [
  param("stickyId")
    .isMongoId()
    .withMessage("Sticky ID must be a valid MongoDB ObjectId"),
];

export const getStickiesValidation = [
  query("type")
    .optional()
    .isIn(["project", "task", "scribble"])
    .withMessage("Type must be one of: project, task, scribble"),
  
  query("projectId")
    .optional()
    .isMongoId()
    .withMessage("Project ID must be a valid MongoDB ObjectId"),
  
  query("taskId")
    .optional()
    .isMongoId()
    .withMessage("Task ID must be a valid MongoDB ObjectId"),
];

export const workspaceParamValidation = [
  param("workspaceId")
    .isMongoId()
    .withMessage("Workspace ID must be a valid MongoDB ObjectId"),
];