import { z } from "zod";

export const verifyOtpSchema = z.object({
  email: z.string().email("Enter a valid email"),
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^[0-9]+$/, "OTP must contain only numbers"),
});

export type verifyOtpForm = z.infer<typeof verifyOtpSchema>;
