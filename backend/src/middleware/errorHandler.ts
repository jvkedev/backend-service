import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

/**
 * Global error handler middleware for Express
 * Logs server errors (500+) as errors and client errors as warnings,
 * then return a consistent JSON response structure
 */
function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const statusCode = Number(error.statusCode) || 500;

  if (statusCode >= 500) {
    logger.error(error.message, {
      stack: error.stack,
      details: error.details,
      path: req.originalUrl,
      method: req.method,
    });
  } else {
    logger.warn(error.message, {
      stack: error.stack,
      details: error.details,
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong",
    details: error.details || undefined,
  });
}

export default errorHandler;
