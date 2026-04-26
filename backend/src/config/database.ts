import mongoose from "mongoose";
import env from "./env.js";
import logger from "../utils/logger.js";
import Otp from "../models/otp.js";
import User from "../models/user.js";

// Connect to MongoDB
async function connectDatabase() {
  // Enforce strict query filtering
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri);
  await Otp.syncIndexes();
  await User.syncIndexes();

  const otpIndexes = await Otp.collection.getIndexes();
  console.log("OTP indexes:", otpIndexes);

  const userIndexes = await User.collection.getIndexes();
  console.log("User indexes:", userIndexes);

  logger.info("Connected to MongoDB");
}

export default connectDatabase;
