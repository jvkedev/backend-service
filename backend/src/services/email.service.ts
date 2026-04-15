import { Resend } from "resend";
import env from "../config/env.js";

const resend = new Resend(env.resendApiKey);

export const sendOtpEmail = async (email: string, otp: string) => {
  console.log("📨 sendOtpEmail ENTERED");
  return resend.emails.send({
    from: "noreply@jvke.in",
    to: email,
    subject: "Verify your account",
    html: `<h1>Your Otp: ${otp}</h1>`,
  });
};
