"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthMutations } from "@/hooks/use-mutations";
import { passwordSchema } from "@/lib/schemas/schemas";
import { PasswordRequirements } from "@/components/auth/password-requirements";

// --- Schemas ---
const step1Schema = z.object({
  email: z.string().email("Invalid email address"),
});

const step2Schema = z.object({
  otp: z.string().length(6, "Code must be 6 digits"),
});

const step3Schema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const { forgotPasswordMutation, resetPasswordMutation } = useAuthMutations();
  const router = useRouter();

  // --- Step 1: Send Email ---
  const Step1Form = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
      resolver: zodResolver(step1Schema),
      defaultValues: { email }
    });

    const onSubmit = (data: Step1Data) => {
      forgotPasswordMutation.mutate(data, {
        onSuccess: () => {
          setEmail(data.email);
          setStep(2);
          toast.success("Reset code sent to your email");
        }
      });
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#0e141b] dark:text-white" htmlFor="email">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#507395] dark:text-gray-500 group-focus-within:text-[#4c99e6]">
              <span className="material-symbols-outlined text-[20px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              </span>
            </div>
            <input {...register("email")} id="email" type="email" placeholder="name@company.com" className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] pl-10 py-3 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] focus:outline-none sm:text-sm transition-colors shadow-sm" />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={forgotPasswordMutation.isPending} className="w-full flex items-center justify-center rounded-lg bg-[#4c99e6] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#4c99e6] focus:ring-offset-2 transition-colors mt-2 disabled:opacity-70">
          {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    );
  };

  // --- Step 2: Enter OTP ---
  const Step2Form = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<Step2Data>({
      resolver: zodResolver(step2Schema)
    });

    const onSubmit = (data: Step2Data) => {
      setOtp(data.otp);
      setStep(3);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center mb-6">
          <p className="text-[#507395] dark:text-gray-400 text-sm">We sent a verification code to <span className="font-semibold text-[#0e141b] dark:text-white">{email}</span></p>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#0e141b] dark:text-white text-center mb-2" htmlFor="otp">Verification Code</label>
          <input {...register("otp")} id="otp" type="text" maxLength={6} placeholder="123456" className="block w-full text-center text-2xl font-bold tracking-widest rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] py-3 text-[#0e141b] dark:text-white placeholder-gray-300 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] focus:outline-none transition-colors shadow-sm" />
          {errors.otp && <p className="text-red-500 text-xs mt-1 text-center">{errors.otp.message}</p>}
        </div>
        <button type="submit" className="w-full flex items-center justify-center rounded-lg bg-[#4c99e6] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#4c99e6] focus:ring-offset-2 transition-colors">
          Verify Code
        </button>
        <div className="text-center mt-4">
          <span className="text-sm text-[#507395] dark:text-gray-400">Didn't receive the code? </span>
          <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-[#4c99e6] hover:underline focus:outline-none">Click to resend</button>
        </div>
      </form>
    );
  };

  // --- Step 3: Set New Password ---
  const Step3Form = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<Step3Data>({
      resolver: zodResolver(step3Schema),
      mode: "onChange"
    });

    const passwordValue = watch("password", "");

    const onSubmit = (data: Step3Data) => {
      resetPasswordMutation.mutate({
        email,
        code: otp,
        newPassword: data.password
      }, {
        onSuccess: () => {
          toast.success("Password reset successfully!");
          router.push("/auth/login");
        }
      });
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#0e141b] dark:text-white" htmlFor="password">New Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#507395] dark:text-gray-500 group-focus-within:text-[#4c99e6]">
              <span className="material-symbols-outlined text-[20px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </span>
            </div>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="••••••••"
              className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] pl-10 pr-10 py-3 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] focus:outline-none sm:text-sm transition-colors shadow-sm" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#507395] hover:text-[#0e141b] focus:outline-none"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          <PasswordRequirements value={passwordValue} />

        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#0e141b] dark:text-white" htmlFor="confirm-password">Confirm Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#507395] dark:text-gray-500 group-focus-within:text-[#4c99e6]">
              <span className="material-symbols-outlined text-[20px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </span>
            </div>
            <input
              {...register("confirmPassword")}
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] pl-10 pr-10 py-3 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] focus:outline-none sm:text-sm transition-colors shadow-sm" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#507395] hover:text-[#0e141b] focus:outline-none"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={!isValid || resetPasswordMutation.isPending} className="w-full flex items-center justify-center rounded-lg bg-[#4c99e6] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#4c99e6] focus:ring-offset-2 transition-colors mt-2 disabled:opacity-70">
          {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    );
  };

  return (
    <div className="bg-[#f6f7f8] dark:bg-[#111921] min-h-screen flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e8edf3] dark:border-[#2d3a46] px-10 py-3 bg-white dark:bg-[#1a242f]">
        <div className="flex items-center gap-4 text-[#0e141b] dark:text-white">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl fill-1">grid_view</span>
            <span className="text-xl font-black tracking-tighter text-foreground uppercase">Clbio</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-[#507395] dark:text-gray-400 hidden sm:block">Remember password?</span>
          <Link className="text-[#4c99e6] text-sm font-bold leading-normal tracking-[0.015em] hover:underline" href="/auth/login">
            Sign in
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-[480px] bg-white dark:bg-[#1a242f] rounded-xl shadow-lg border border-[#e8edf3] dark:border-[#2d3a46] p-8 md:p-10">

          <div className="text-center mb-8">
            <h1 className="text-[#0e141b] dark:text-white tracking-tight text-[32px] font-bold leading-tight mb-2">
              {step === 1 && "Forgot Password"}
              {step === 2 && "Enter OTP"}
              {step === 3 && "Set new password"}
            </h1>
            <p className="text-[#507395] dark:text-gray-400 text-base font-normal leading-normal">
              {step === 1 && "Enter your email and we'll send you a reset link."}
              {step === 2 && "Enter the 6-digit code sent to your email."}
              {step === 3 && "Your new password must be different from previous used passwords."}
            </p>
          </div>

          {step === 1 && <Step1Form />}
          {step === 2 && <Step2Form />}
          {step === 3 && <Step3Form />}

          {step === 1 && (
            <div className="text-center mt-4">
              <Link className="text-sm font-medium text-[#507395] dark:text-gray-400 hover:text-[#0e141b] dark:hover:text-white transition-colors flex items-center justify-center gap-2" href="/auth/login">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}