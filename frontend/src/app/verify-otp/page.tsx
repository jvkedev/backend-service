"use client";

import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOtpSchema, type verifyOtpForm } from "@/lib/verifyOtpSchema";
import FormCard from "@/components/FormCard";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { apiRequest } from "@/lib/api";

type VerifyOtpForm = {
  email: string;
  otp: string;
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpForm>({
    resolver: zodResolver(verifyOtpSchema),
    mode: "onChange",
    defaultValues: {
      email: emailFromUrl,
      otp: "",
    },
  });

  async function onSubmit(data: VerifyOtpForm) {
    try {
      const res = await apiRequest<{ message: string; token?: string }>(
        "/api/auth/verify-otp",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );

      toast.success(res.message);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong");
      }
    }
  }

  return (
    <FormCard title="Verify email">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <p className="text-sm text-gray-500">
          Enter the code sent to your email address.
        </p>
        <div>
          <Input
            label="Email"
            type="email"
            {...register("email")}
            placeholder="jane@example.com"
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Input
            label="OTP code"
            autoFocus
            {...register("otp")}
            placeholder="6-digit code"
            maxLength={6}
          />
          <FieldError message={errors.otp?.message} />
        </div>
        <Button type="submit">Verify</Button>
        <p className="text-sm text-center text-gray-500">
          <Link href="/register" className="text-gray-900 underline">
            Back to register
          </Link>
        </p>
      </form>
    </FormCard>
  );
}
