import dotenv from "dotenv";

dotenv.config();

const required = (key: string) => {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not defined`);
  return value;
};

export default {
  port: Number(process.env.PORT) || 4000,

  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/midnightcode",

  nodeEnv:
    (process.env.NODE_ENV as "development" | "production" | "test") ||
    "production",

  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",

  logs: {
    level: process.env.LOG_LEVEL || "silly",
  },

  otpSecret: required("OTP_SECRET"),

  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 300,

  redisUrl: required("REDIS_URL"),

  openAiApiKey: required("OPENAI_API_KEY"),
  resendApiKey: required("RESEND_API_KEY"),
};
