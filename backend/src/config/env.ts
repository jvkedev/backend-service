import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export default {
  port: Number(process.env.PORT) || 4000,

  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/midnightcode",

  nodeEnv: process.env.NODE_ENV || "production",

  jwtSecret: process.env.JWT_SECRET!, 

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",

  cacheTtlSeconds: Number(process.env.CACHE_TTL_SECONDS) || 300,

  redisUrl: process.env.REDIS_URL || "",

  openAiApiKey: process.env.OPENAI_API_KEY || "",
};
