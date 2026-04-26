import { Resend } from "resend";
import env from "../config/env.js";
import logger from "../utils/logger.js";

const resend = new Resend(env.resendApiKey);

export const sendOtpEmail = async (email: string, otp: string) => {
  logger.info("Sending OTP email", { email });
  return resend.emails.send({
    from: "noreply@jvke.in",
    to: email,
    subject: "Verify your account",
    html: `<h1>Your Otp: ${otp}</h1>`,
  });
};
