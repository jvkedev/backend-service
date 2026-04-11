import mongoose from "mongoose";
import env from "./env";
import logger from "../utils/logger";

async function connectDatabase() {
  mongoose.set("strictQuery", true); // Enable strict query mode to avoid unexpected query behavior from unknonwn fields
  await mongoose.connect(env.mongoUri);
  logger.info("Connected to MongoDB");
}

export default connectDatabase;
