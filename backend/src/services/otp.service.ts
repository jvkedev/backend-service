import crypto from "crypto";
import env from "../config/env.js";

export const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const hashOtp = (otp: string) => {
  return crypto.createHash("sha256").update(otp + env.otpSecret).digest("hex");
};
