import User from "../models/user.js";
import Otp from "../models/otp.js";
import HttpError from "../utils/httpError.js";
import logger from "../utils/logger.js";
import generateToken from "../utils/generateToken.js";
import { emailQueue } from "../queues/email.queue.js";
import { generateOtp, hashOtp } from "./otp.service.js";

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

export async function registerUserWithOtp(
  userData: RegisterUserInput,
  requestId?: string,
) {
  const { fullName, email, password } = userData;

  await Otp.deleteMany({
    "userData.email": email,
    verified: false,
  });

  const otp = generateOtp();

  await Otp.create({
    userData: { fullName, email, password },
    otp: hashOtp(otp),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    attempts: 0,
    verified: false,
  });

  await emailQueue.add(
    "send-otp",
    { email, otp },
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

  logger.info("OTP generated and queued", {
    requestId,
    email,
  });
}

export async function verifyUserOtp(
  data: VerifyOtpInput,
  requestId?: string,
): Promise<VerifyOtpResult> {
  const { email, otp } = data;

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
      requestId,
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
    requestId,
    userId: user._id.toString(),
    email: user.email,
  });

  return {
    userId: user._id.toString(),
    email: user.email,
    token,
  };
}
