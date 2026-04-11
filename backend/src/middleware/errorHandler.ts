import { Request, Response, NextFunction } from "express";

function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const statusCode = Number(error.statusCode) || 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Something went wrong",
    details: error.details || undefined,
  });
}

export default errorHandler;
