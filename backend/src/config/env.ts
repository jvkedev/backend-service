import dotenv from "dotenv";

dotenv.config();

export default {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/midnightcode",
  jwtSecret: process.env.JWT_SECRET || "dev_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  catcheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 300,
  redisUrl: process.env.Redis_URL || "",
  openAiApiKey: process.env.OpenAI_Api_Key || "",
};
