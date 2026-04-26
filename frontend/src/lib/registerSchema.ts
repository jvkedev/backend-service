import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .regex(/^[a-zA-Z ]+$/, "Only letters and spaces are allowed"),

    email: z.string().min(1, "Email is required").email("Enter a valid email"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long")
      .refine((v) => !v.includes(" "), "Password cannot contain spaces")
      .refine(
        (v) => /[A-Z]/.test(v),
        "Must include at least one uppercase letter",
      )
      .refine(
        (v) => /[a-z]/.test(v),
        "Must include at least one lowercase letter",
      )
      .refine((v) => /[0-9]/.test(v), "Must include at least one number")
      .refine(
        (v) => /[@$!%?&]/.test(v),
        "Must include at least one special character",
      ),

    confirmPassword: z.string().min(1, "Please confirm your password"),

    role: z.enum(["student", "counselor"], {
      message: "Select a role",
    }),

    acceptTerms: z
      .boolean()
      .refine((v) => v === true, "You must accept the terms"),

    targetCountries: z.array(z.string()).optional(),
    interestedFields: z.array(z.string()).optional(),
    preferredIntake: z.string().optional(),
    maxBudgetUsd: z.number().positive("Must be a positive number").optional(),

    englishTest: z
      .object({
        exam: z.string().optional(),
        score: z.number().positive("Enter a valid score").optional(),
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
