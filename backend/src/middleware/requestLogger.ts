import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";
import { performance } from "node:perf_hooks";

function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();

  res.on("finish", () => {
    const durationMs = performance.now() - start;

    logger.info("Request completed", {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    });
  });

  next();
}

export default requestLogger;
