import express from "express";
import authController from "../controller/auth.controller.js";

const router = express.Router();

// Public route for user registration (no authentication required)
router.post("/register", authController.register);

router.post("/verify-otp", authController.verifyOtp);

router.post("/login", authController.login);

export default router;
