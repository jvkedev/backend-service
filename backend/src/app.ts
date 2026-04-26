import express from "express";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js";
import { requestIdMiddleware } from "./middleware/requestId.js";
import requestLogger from "./middleware/requestLogger.js";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(requestIdMiddleware);
app.use(requestLogger);

// Auth routes
app.use("/api/auth", authRoutes);

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;
