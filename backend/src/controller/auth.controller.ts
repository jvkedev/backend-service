import asyncHandler from "../utils/asyncHandler.js";
import HttpError from "../utils/httpError.js";
import env from "../config/env.js";
import {
  registerUserSchema,
  verifyOtpSchema,
  loginUserSchema,
} from "../validators/authValidators.js";
import {
  registerUserWithOtp,
  verifyUserOtp,
  loginUser,
} from "../services/auth.service.js";
import { formatZodErrors } from "../utils/validates.utils.js";

// Handles user registration: validates input, triggers OTP flow, and returns response
const register = asyncHandler(async (req, res) => {
  const result = registerUserSchema.safeParse(req.body);

  if (!result.success) {
    throw new HttpError(
      400,
      "Validation failed",
      formatZodErrors(result.error.issues),
    );
  }

  await registerUserWithOtp(result.data, req.requestId);

  res.status(202).json({
    message: "OTP sent to your email. Please verify your account",
    email: result.data.email,
  });
});

// Handles OTP verification: validates input, verifies OTP via service, and returns authenticated user with token
const verifyOtp = asyncHandler(async (req, res) => {
  const result = verifyOtpSchema.safeParse(req.body);

  if (!result.success) {
    throw new HttpError(
      400,
      "Validation failed",
      formatZodErrors(result.error.issues),
    );
  }

  const verifiedUser = await verifyUserOtp(result.data, req.requestId);

  res.cookie("accessToken", verifiedUser.token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "Account verified successfully",
    user: {
      userId: verifiedUser.userId,
      email: verifiedUser.email,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const result = loginUserSchema.safeParse(req.body);

  if (!result.success) {
    throw new HttpError(
      400,
      "Validation failed",
      formatZodErrors(result.error.issues),
    );
  }

  const loggedInUser = await loginUser(result.data, req.requestId);

  res.cookie("accessToken", loggedInUser.token, {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "Login successful",
    user: {
      userId: loggedInUser.userId,
      fullName: loggedInUser.fullName,
      email: loggedInUser.email,
    },
  });
});

export default { register, verifyOtp, login };
