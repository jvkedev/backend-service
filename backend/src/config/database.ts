import mongoose from "mongoose";
import env from "./env.js";
import logger from "../utils/logger.js";
import Otp from "../models/otp.js";

// Connect to MongoDB
async function connectDatabase() {
  // Enforce strict query filtering
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  await Otp.syncIndexes();
  logger.info("Connected to MongoDB");
}

export default connectDatabase;
