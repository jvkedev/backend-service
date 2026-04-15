import { z } from "zod";

// Validation schema for user registration
export const registerUserSchema = z.object({
  fullName: z
    .string({
      error: "Full name is required",
    })
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name is too long")
    .refine((v) => /^[a-zA-Z\s]+$/.test(v), {
      message: "Full name can only contain letters and spaces",
    }),

  email: z
    .string({
      error: "Email is required",
    })
    .email("Invalid email format")
    .transform((e) => e.toLowerCase().trim()),

  password: z
    .string({
      error: "Password is required",
    })
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .refine((v) => !v.includes(" "), {
      message: "Password cannot contain spaces",
    })
    .refine((v) => /[A-Z]/.test(v), {
      message: "Must include at least one uppercase letter",
    })
    .refine((v) => /[a-z]/.test(v), {
      message: "Must include at least one lowercase letter",
    })
    .refine((v) => /[0-9]/.test(v), {
      message: "Must include at least one number",
    })
    .refine((v) => /[@$!%?&]/.test(v), {
      message: "Must include at least one special character",
    })
    .transform((v) => v.trim()),

  acceptTerms: z
    .boolean({
      error: "You must accept terms and conditions",
    })
    .refine((v) => v === true, {
      message: "You must accept terms and conditions",
    }),
});

export const verifyOtpSchema = z.object({
  email: z
    .string({
      error: "Email is required",
    })
    .email("Invalid email format")
    .transform((e) => e.toLowerCase().trim()),

  otp: z
    .string({
      error: "OTP is required",
    })
    .trim()
    .length(6, "OTP must be exactly 6 digits")
    .refine((v) => /^\d{6}$/.test(v), {
      message: "OTP must be exactly 6 digits",
    }),
});
