  import crypto from "crypto";
  import { Request, Response, NextFunction } from "express";

  export const requestIdMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    req.requestId = crypto.randomUUID();
    next();
  };
