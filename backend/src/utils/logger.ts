import winston from "winston";
import env from "../config/env.js";

const { combine, timestamp, errors, splat, json, colorize, printf } =
  winston.format;

const isDevelopment = env.nodeEnv === "development";

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  splat(),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const extra =
      Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta, null, 2)}` : "";

    return stack
      ? `[${timestamp}] ${level}: ${stack}${extra}`
      : `[${timestamp}] ${level}: ${message}${extra}`;
  }),
);

const prodFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  splat(),
  json(),
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: isDevelopment ? devFormat : prodFormat,
  }),
];

if (!isDevelopment) {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: prodFormat,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      format: prodFormat,
    }),
  );
}

const logger = winston.createLogger({
  level: env.logs.level || "info",
  defaultMeta: {
    service: "backend-service",
  },
  transports,
  exitOnError: false,
});

export default logger;
