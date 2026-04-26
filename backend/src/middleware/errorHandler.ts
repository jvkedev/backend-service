import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

type AppErrorShape = {
  statusCode: number;
  details?: unknown;
};

function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  let statusCode = 500;
  let message = "Internal Server Error";
  let details: unknown;

  if (error instanceof Error) {
    message = error.message;
  }

  if (typeof error === "object" && error !== null) {
    const customError = error as AppErrorShape;

    if (typeof customError.statusCode == "number") {
      statusCode = customError.statusCode;
    }

    if ("details" in customError) {
      details = customError.details;
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
    logger.warn("Client error occured", logPayload);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
  });
}

export default errorHandler;
