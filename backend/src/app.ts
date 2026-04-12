import express from "express";

import authRoutes from "./routes/authRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;
