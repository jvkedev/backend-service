import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";
import { normalizeIp } from "../utils/ip.util.js";

function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;

    const sanitizedBody = {
      ...req.body,
      password: req.body?.password ? "***REDACTED***" : undefined,
      confirmPassword: req.body?.confirmPassword ? "***REDACTED***" : undefined,
      otp: req.body?.otp ? "***REDACTED***" : undefined,
    };

    const logPayload = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: normalizeIp(req.ip),
      body: sanitizedBody,
    };

    if (res.statusCode >= 500) {
      logger.error("Request completed with server error", logPayload);
    } else if (res.statusCode >= 400) {
      logger.warn("Request completed with client error", logPayload);
    } else {
      logger.info("Request completed", logPayload);
    }
  });

  next();
}

export default requestLogger;
