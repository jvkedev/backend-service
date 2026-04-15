import asyncHandler from "../utils/asyncHandler.js";
import HttpError from "../utils/httpError.js";
import User from "../models/user.js";
import Otp from "../models/otp.js";
import {
  registerUserSchema,
  verifyOtpSchema,
} from "../validators/authValidators.js";
import logger from "../utils/logger.js";
import { emailQueue } from "../queues/email.queue.js";
import { generateOtp, hashOtp } from "../services/otp.service.js";
import generateToken from "../utils/generateToken.js";

// Handles user registration: validates input, checks duplicates, creates user, and returns JWT token
const register = asyncHandler(async (req, res) => {
  // Validates request body using Zod schema
  const result = registerUserSchema.safeParse(req.body);

  if (!result.success) {
    throw new HttpError(
      400,
      "Validation failed",
      result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }

  const { fullName, email, password } = result.data;

  await Otp.deleteMany({
    "userData.email": email,
    verified: false,
  });

  const otp = generateOtp();

  await Otp.create({
    userData: { fullName, email, password },
    otp: hashOtp(otp),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 Min
    attempts: 0,
    verified: false,
  });

  await emailQueue.add(
    "send-otp",
    {
      email,
      otp,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  logger.info("OTP generated and queued", { requestId: req.requestId, email });

  res.status(201).json({
    message: "OTP sent to your email. Please verified your account",
    email,
  });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const result = verifyOtpSchema.safeParse(req.body);

  if (!result.success) {
    throw new HttpError(
      400,
      "Validation failed",
      result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    );
  }
  const { email, otp } = result.data;

  const otpRecord = await Otp.findOne({
    "userData.email": email,
    verified: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new HttpError(400, "OTP not found or already used");
  }

  if (otpRecord.expiresAt < new Date()) {
    await Otp.deleteMany({ "userData.email": email });
    throw new HttpError(410, "OTP expired");
  }

  if (otpRecord.attempts >= 5) {
    await Otp.deleteMany({ "userData.email": email });
    throw new HttpError(429, "Too many attempts");
  }

  const hashedInput = hashOtp(otp);

  if (hashedInput !== otpRecord.otp) {
    otpRecord.attempts += 1;
    await otpRecord.save();

    logger.warn("Invalid OTP attempt", {
      requestId: req.requestId,
      email,
      attempts: otpRecord.attempts,
    });

    throw new HttpError(401, "Invalid OTP");
  }

  if (!otpRecord.userData) {
    throw new HttpError(500, "OTP record is missing user data");
  }

  otpRecord.verified = true;
  await otpRecord.save();

  const user = await User.create({
    fullName: otpRecord.userData.fullName,
    email: otpRecord.userData.email,
    password: otpRecord.userData.password,
    isVerified: true,
  });

  await Otp.deleteMany({ "userData.email": email });

  const token = generateToken(user._id.toString());

  logger.info("User verified successfully", {
    requestId: req.requestId,
    userId: user._id.toString(),
    email: user.email,
  });

  res.status(200).json({
    message: "Account verified successfully",
    user: {
      userId: user._id,
      email: user.email,
      token,
    },
  });
});

export default { register, verifyOtp };
