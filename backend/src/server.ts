import app from "./app.js";
import connectDatabase from "./config/database.js";
import env from "./config/env.js";
import logger from "./utils/logger.js";

// Initialize and start the application
async function startServer() {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log("NODE_ENV:", env.nodeEnv);
    logger.info(`Server is running on port ${env.port}`);
  });
}

// Handle startup failure
startServer().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});
