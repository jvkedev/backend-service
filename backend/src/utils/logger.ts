import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({
      format: () => new Date().toISOString().replace("T", " ").substring(0, 19),
    }),
    winston.format.printf((info: any) => {
      const { level, message, timestamp } = info;
      return `[${timestamp}] ${level}: ${message}`;
    }),
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
