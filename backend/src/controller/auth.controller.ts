import asyncHandler from "../utils/asyncHandler.js";
import HttpError from "../utils/httpError.js";
import User from "../models/user.js";
import { registerUserSchema } from "../validators/authValidators.js";
import generateToken from "../utils/generateToken.js";
import logger from "../utils/logger.js";

// Handles user registration: validates input, checks duplicates, creates user, and returns JWT token
const register = asyncHandler(async (req, res) => {
  // Validates request body using Zod schema
  const result = registerUserSchema.safeParse(req.body);

  if (!result.success) {
    throw new HttpError(
      400,
      "Validation failed",
      result.error.issues.map((err) => err.message),
    );
  }

  const { fullName, email, password } = result.data;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new HttpError(409, "User already exists");
  }

  const user = new User({
    fullName,
    email,
    password,
  });

  await user.save();

  const token = generateToken(user._id.toString());

  logger.info("User registered", {
    userId: user._id.toString(),
    email: user.email,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  res.status(201).json({
    message: "User registered successfully",
    user: {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      token,
    },
  });
});

export default { register };
