import winston from "winston";
import env from "../config/env.js";

/**
 * Application-wide logger using Winston.
 * Formats logs with timestamps, request metadata and environmental based debug details.
 * In development, includes extra fields like userId, email, and request details.
 */
const isDev = env.nodeEnv !== "production";

const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp({
      format: () => new Date().toISOString().replace("T", " ").substring(0, 19),
    }),

    winston.format.printf((info: any) => {
      const { level, message, timestamp, ...meta } = info;

      let log = `[${timestamp}] ${level.toUpperCase()} ${message}`;

      if (meta.method && meta.path) {
        log += ` | ${meta.method} ${meta.path}`;
      }

      if (meta.ip) {
        const ip = meta.ip.replace("::ffff:", "");
        log += ` | IP ${ip}`;
      }

      if (isDev) {
        if (meta.userId) log += ` | userId ${meta.userId}`;
        if (meta.email) log += ` | email ${meta.email}`;
        if (meta.details) log += ` | details ${JSON.stringify(meta.details)}`;
      }

      if (level === "error" && meta.stack) {
        log += `\nSTACK\n${meta.stack}`;
      }

      return log;
    }),
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
