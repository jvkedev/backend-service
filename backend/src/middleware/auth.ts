import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/user.js";
import HttpError from "../utils/httpError.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";

// Authentication middleware that validates JWT token and attaches user to request object
const requireAuth = asyncHandler(async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    throw new HttpError(401, "Authorization token missing.");
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (typeof decoded === "string" || typeof decoded.sub !== "string") {
      throw new HttpError(401, "Invalid token payload");
    }

    const user = await User.findById(decoded.sub).select("-password");

    if (!user) {
      throw new HttpError(401, "Authorization user no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown JWT error";

    logger.warn("Invalid JWT", { message });
    throw new HttpError(401, "Invalid or expired token.");
  }
});

export default requireAuth;
