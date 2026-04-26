  import { performance } from "node:perf_hooks";
  import { redis } from "../config/redis.js";
  import bcrypt from "bcryptjs";
  import User from "../models/user.js";
  import Otp from "../models/otp.js";
  import HttpError from "../utils/httpError.js";
  import logger from "../utils/logger.js";
  import generateToken from "../utils/generateToken.js";
  import { emailQueue } from "../queues/email.queue.js";
  import { generateOtp, hashOtp } from "./otp.service.js";
  import config from "../config/env.js";

  type RegisterUserInput = {
    fullName: string;
    email: string;
    password: string;
  };

  type VerifyOtpInput = {
    email: string;
    otp: string;
  };

  type VerifyOtpResult = {
    userId: string;
    email: string;
    token: string;
  };

  type LoginUserInput = {
    email: string;
    password: string;
  };

  type LoginUserResult = {
    userId: string;
    fullName: string;
    email: string;
    token: string;
  };

  type LoginUserCache = {
    _id: string;
    fullName: string;
    email: string;
    password: string;
  };

  export async function registerUserWithOtp(
    data: RegisterUserInput,
    requestId?: string,
  ): Promise<{ message: string }> {
    const totalStart = performance.now();
    const timings: Record<string, number> = {};

    const { fullName, email, password } = data;

    let start = performance.now();
    let otp = generateOtp();
    timings.generateOtp = performance.now() - start;

    if (config.nodeEnv === "test") {
      otp = "123456";
    }

    start = performance.now();
    const hashedPassword = await bcrypt.hash(password, 8);
    timings.hashPassword = performance.now() - start;

    start = performance.now();
    await Otp.findOneAndUpdate(
      { "userData.email": email },
      {
        $set: {
          userData: { fullName, email, password: hashedPassword },
          otp: hashOtp(otp),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          attempts: 0,
          verified: false,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );
    timings.upsertOtpRecord = performance.now() - start;

    start = performance.now();
    await emailQueue.add("send-otp", { email, otp });
    timings.enququeOtpEmail = performance.now() - start;

    timings.total = performance.now() - totalStart;

    logger.info("OTP generated and queued", {
      requestId,
      email,
      timings,
    });

    return {
      message: "Signup request recieved. Please verify OTP.",
    };
  }

  export async function verifyUserOtp(
    data: VerifyOtpInput,
    requestId?: string,
  ): Promise<VerifyOtpResult> {
    const totalStart = performance.now();
    const timings: Record<string, number> = {};

    const { email, otp } = data;

    let start = performance.now();
    const otpRecord = await Otp.findOne({
      "userData.email": email,
      verified: false,
    });
    timings.findOtpRecord = performance.now() - start;

    if (!otpRecord) {
      timings.total = performance.now() - totalStart;

      logger.warn("verifyUserOtp failed", {
        requestId,
        email,
        reason: "OTP not found or already used",
        timings,
      });

      throw new HttpError(400, "OTP not found or already used");
    }

    if (!otpRecord.userData) {
      timings.total = performance.now() - totalStart;

      logger.error("verifyUserOtp failed", {
        requestId,
        email,
        reason: "OTP record is missing user data",
        timings,
      });

      throw new HttpError(500, "OTP record is missing user data");
    }

    if (otpRecord.expiresAt < new Date()) {
      start = performance.now();
      await Otp.deleteOne({ _id: otpRecord._id });
      timings.deleteExpiredOtp = performance.now() - start;
      timings.total = performance.now() - totalStart;

      logger.warn("verifyUserOtp failed", {
        requestId,
        email,
        reason: "OTP expired",
        timings,
      });

      throw new HttpError(410, "OTP expired");
    }

    if (otpRecord.attempts >= 5) {
      start = performance.now();
      await Otp.deleteOne({ _id: otpRecord._id });
      timings.deleteLockedOtp = performance.now() - start;
      timings.total = performance.now() - totalStart;

      logger.warn("verifyUserOtp failed", {
        requestId,
        email,
        reason: "Too many attempts",
        attempts: otpRecord.attempts,
        timings,
      });

      throw new HttpError(429, "Too many attempts");
    }

    start = performance.now();
    const hashedInput = hashOtp(otp);
    timings.hashOtp = performance.now() - start;

    start = performance.now();
    const isOtpValid = hashedInput === otpRecord.otp;
    timings.compareOtp = performance.now() - start;

    if (!isOtpValid) {
      start = performance.now();
      otpRecord.attempts += 1;
      await otpRecord.save();
      timings.saveInvalidAttempt = performance.now() - start;
      timings.total = performance.now() - totalStart;

      logger.warn("verifyUserOtp failed", {
        requestId,
        email,
        reason: "Invalid OTP",
        attempts: otpRecord.attempts,
        timings,
      });

      throw new HttpError(401, "Invalid OTP");
    }

    start = performance.now();
    const user = await User.create({
      fullName: otpRecord.userData.fullName,
      email: otpRecord.userData.email,
      password: otpRecord.userData.password,
      isVerified: true,
    });
    timings.createUser = performance.now() - start;

    start = performance.now();
    await Otp.updateOne({ _id: otpRecord._id }, { $set: { verified: true } });
    timings.markOtpUsed = performance.now() - start;

    start = performance.now();
    const token = generateToken(user._id.toString());
    timings.generateToken = performance.now() - start;

    timings.total = performance.now() - totalStart;

    logger.info("User verified successfully", {
      requestId,
      userId: user._id.toString(),
      email: user.email,
      timings,
    });

    return {
      userId: user._id.toString(),
      email: user.email,
      token,
    };
  }

  export async function loginUser(
    data: LoginUserInput,
    requestId?: string,
  ): Promise<LoginUserResult> {
    const totalStart = performance.now();
    const timings: Record<string, number> = {};

    const { email, password } = data;
    const cacheKey = `user:login:${email}`;

    let start = performance.now();

    const cachedUser = await redis.get(cacheKey);
    timings.redisGet = Number((performance.now() - start).toFixed(2));

    let user: LoginUserCache;

    if (cachedUser) {
      user = JSON.parse(cachedUser) as LoginUserCache;
    } else {
      start = performance.now();

      const dbUser = await User.findOne({ email })
        .select("_id fullName email password")
        .lean();

      timings.findUser = Number((performance.now() - start).toFixed(2));

      if (!dbUser) {
        timings.total = performance.now() - totalStart;

        logger.warn("loginUser failed", {
          requestId,
          email,
          reason: "User not found",
          timings,
        });

        throw new HttpError(401, "Invalid email or password");
      }

      user = {
        _id: dbUser._id.toString(),
        fullName: dbUser.fullName,
        email: dbUser.email,
        password: dbUser.password,
      };

      start = performance.now();

      await redis.set(cacheKey, JSON.stringify(user), "EX", 300);
      timings.redisSet = Number((performance.now() - start).toFixed(2));
    }

    start = performance.now();

    const isPasswordValid = await bcrypt.compare(password, user.password);
    timings.comparePassword = Number((performance.now() - start).toFixed(2));

    if (!isPasswordValid) {
      timings.total = Number((performance.now() - totalStart).toFixed(2));

      logger.warn("loginUser failed", {
        requestId,
        email,
        reason: "Invalid password",
        timings,
      });

      throw new HttpError(401, "Invalid email or password");
    }

    start = performance.now();

    const token = generateToken(user._id);

    timings.generateToken = Number((performance.now() - start).toFixed(2));
    timings.total = Number((performance.now() - totalStart).toFixed(2));

    // if (timings.total > 700) {
      logger.info("User logged in successfully", {
        requestId,
        userId: user?._id,
        email: user?.email,
        timings,
      });
    // }
    return {
      userId: user._id,
      fullName: user.fullName,
      email: user.email,
      token,
    };
  }
