import { Request, Response, NextFunction } from "express";

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

  res.status(statusCode).json({
    success: false,
    message,
    details,
  });
}

export default errorHandler;
