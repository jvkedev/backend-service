import express from "express";
import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import requestLogger from "./middleware/requestLogger.js";

const app = express();

app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLogger);

// Auth routes
app.use("/api/auth", authRoutes);

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;
