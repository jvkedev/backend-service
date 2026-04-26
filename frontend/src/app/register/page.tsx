"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { registerSchema, type RegisterFormData } from "@/lib/registerSchema";
import FormCard from "@/components/FormCard";
import { apiRequest } from "@/lib/api";

// ── static option lists ──────────────────────────────────────────────────────

const COUNTRIES = [
  "USA",
  "UK",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Netherlands",
  "New Zealand",
];
const FIELDS = [
  "Computer Science",
  "Business",
  "Engineering",
  "Medicine",
  "Law",
  "Arts",
  "Economics",
  "Psychology",
];
const INTAKES = [
  "January 2025",
  "May 2025",
  "September 2025",
  "January 2026",
  "September 2026",
];
const EXAMS = ["IELTS", "TOEFL", "PTE", "Duolingo", "GRE", "GMAT"];

// ── tiny helpers ─────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mt-2 mb-3">
      {children}
    </p>
  );
}

const inputCls =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500";

const selectCls =
  "w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-500 bg-white";

function getPasswordRules(password: string) {
  return [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "One special character",
      valid: /[@$!%?&]/.test(password),
    },
    {
      label: "No spaces",
      valid: password.length > 0 && !password.includes(" "),
    },
  ];
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      targetCountries: [],
      interestedFields: [],
    },
  });

  const password =
    useWatch({
      control,
      name: "password",
    }) || "";

  const confirmPassword =
    useWatch({
      control,
      name: "confirmPassword",
    }) || "";

  const passwordDoNotMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  const passwordRules = getPasswordRules(password);
  const passedRules = passwordRules.filter((rule) => rule.valid).length;
  const strengthPercent = (passedRules / passwordRules.length) * 100;

  async function onSubmit(data: RegisterFormData) {
    try {
      const res = await apiRequest<{ message: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          password: data.password,
          acceptTerms: data.acceptTerms,
        }),
      });

      toast.success(res.message);
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  }

  return (
    <FormCard title="Create account" wide>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-5"
      >
        {/* ── Account ── */}
        <SectionLabel>Account</SectionLabel>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Full name */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              type="text"
              placeholder="Jane Doe"
              {...register("fullName")}
              className={inputCls}
            />
            <FieldError message={errors.fullName?.message} />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="jane@example.com"
              {...register("email")}
              className={inputCls}
            />
            <FieldError message={errors.email?.message} />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`${inputCls} pr-10`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <FieldError message={errors.password?.message} />

            {password && (
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Password strength
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    {passedRules <= 2
                      ? "Weak"
                      : passedRules <= 4
                        ? "Medium"
                        : "Strong"}
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passedRules <= 2
                        ? "bg-red-500"
                        : passedRules <= 4
                          ? "bg-yellow-500"
                          : "bg-green-600"
                    }`}
                    style={{ width: `${strengthPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirm password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={`${inputCls} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
            <FieldError
              message={
                passwordDoNotMatch
                  ? "Password do not match"
                  : errors.confirmPassword?.message
              }
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="text-sm font-medium text-gray-700">Role</label>
          <div className="mt-2 flex gap-6">
            {(["student", "counselor"] as const).map((r) => (
              <label
                key={r}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer capitalize"
              >
                <input
                  type="radio"
                  value={r}
                  {...register("role")}
                  className="accent-gray-900"
                />
                {r}
              </label>
            ))}
          </div>
          <FieldError message={errors.role?.message} />
        </div>

        <hr className="border-gray-100" />

        {/* ── Preferences ── */}
        <SectionLabel>Preferences</SectionLabel>

        {/* Target countries */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Target countries
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {COUNTRIES.map((c) => (
              <label
                key={c}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={c}
                  {...register("targetCountries")}
                  className="accent-gray-900"
                />
                {c}
              </label>
            ))}
          </div>
          <FieldError message={errors.targetCountries?.message} />
        </div>

        {/* Interested fields */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Interested fields
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FIELDS.map((f) => (
              <label
                key={f}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={f}
                  {...register("interestedFields")}
                  className="accent-gray-900"
                />
                {f}
              </label>
            ))}
          </div>
          <FieldError message={errors.interestedFields?.message} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Preferred intake */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Preferred intake{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <select {...register("preferredIntake")} className={selectCls}>
              <option value="">Select intake</option>
              {INTAKES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          {/* Max budget */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Max budget (USD){" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 30000"
              {...register("maxBudgetUsd", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              className={inputCls}
            />
            <FieldError message={errors.maxBudgetUsd?.message} />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* ── English test ── */}
        <SectionLabel>English test</SectionLabel>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Exam */}
          <div>
            <label className="text-sm font-medium text-gray-700">Exam</label>
            <select {...register("englishTest.exam")} className={selectCls}>
              <option value="">Select exam</option>
              {EXAMS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <FieldError message={errors.englishTest?.exam?.message} />
          </div>

          {/* Score */}
          <div>
            <label className="text-sm font-medium text-gray-700">Score</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 7.5"
              {...register("englishTest.score", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              className={inputCls}
            />
            <FieldError message={errors.englishTest?.score?.message} />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* ── Terms ── */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register("acceptTerms")}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">
              I accept the terms and conditions
            </span>
          </label>
          <FieldError message={errors.acceptTerms?.message} />
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>

        <p className="text-sm text-center text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-900 underline">
            Login
          </Link>
        </p>
      </form>
    </FormCard>
  );
}
