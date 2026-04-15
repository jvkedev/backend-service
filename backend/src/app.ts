import express from "express";
import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./middleware/errorHandler.js"
import { requestIdMiddleware } from "./middleware/requestId.js";

const app = express();

app.use(express.json());

app.use(requestIdMiddleware)

// Auth routes
app.use("/api/auth", authRoutes);

// Global error handling middleware (must be last)
app.use(errorHandler);
// app.use(requestLogger);

export default app;
