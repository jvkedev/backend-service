import { Request, Response, NextFunction } from "express";
import { RequestHandler } from "express-serve-static-core";

function asyncHandler(handler: RequestHandler) {
  return async function wrapperHandler(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export default asyncHandler;
