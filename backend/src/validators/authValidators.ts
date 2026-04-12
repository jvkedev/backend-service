import { z } from "zod";

// Validation schema for user registration
export const registerUserSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name is too long"),

  email: z
    .string()
    .email("Invalid email format")
    .transform((e) => e.toLowerCase().trim()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
});
