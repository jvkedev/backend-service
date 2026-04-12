import express from "express";
import authController from "../controller/auth.controller.js";
import requireAuth from "../middleware/auth.js";

const router = express.Router();

// Public route for user registration (no authentication required)
router.post("/register", authController.register);

export default router;
