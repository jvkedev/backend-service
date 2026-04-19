import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let statusCode = 500;
  let message = "Internal Server Error";
  let details;

  if (error instanceof Error) {
    message = error.message;
  }

  if (typeof error === "object" && error !== null) {
    if ("statusCode" in error) {
      statusCode = (error as any).statusCode;
    }
    if ("details" in error) {
      details = (error as any).details;
    }
  }

  const logPayload = {
    statusCode,
    message,
    details,
    method: req.method,
    path: req.originalUrl,
    requestId: req.requestId,
    body: {
      ...req.body,
      password: req.body?.password ? "***REDACTED***" : undefined,
      confirmPassword: req.body?.confirmPassword ? "***REDACTED***" : undefined,
      otp: req.body?.otp ? "***REDACTED***" : undefined,
    },
  };

  if (statusCode >= 500) {
    logger.error("Server error", {
      ...logPayload,
      err: error,
    });
  } else {
    logger.warn("Request completed", logPayload);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
  });
}

export default errorHandler;
