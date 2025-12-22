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

// --- Local UI Schemas ---
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

  // NEW: State to hold the security token returned by Step 2
  const [resetToken, setResetToken] = useState("");

  const {
    forgotPasswordMutation,
    resetPasswordValidateOtpMutation,
    resetPasswordWithTokenMutation
  } = useAuthMutations();

  const router = useRouter();

  // --- Step 1: Request OTP ---
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
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </div>
            <input {...register("email")} id="email" type="email" placeholder="name@company.com" className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] pl-10 py-3 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] focus:outline-none sm:text-sm transition-colors shadow-sm" />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <button type="submit" disabled={forgotPasswordMutation.isPending} className="w-full hover:cursor-pointer flex items-center justify-center rounded-lg bg-[#4c99e6] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#4c99e6] focus:ring-offset-2 transition-colors mt-2 disabled:opacity-70">
          {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    );
  };

  // --- Step 2: Validate OTP & Get Token ---
  const Step2Form = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<Step2Data>({
      resolver: zodResolver(step2Schema)
    });

    const onSubmit = (data: Step2Data) => {
      resetPasswordValidateOtpMutation.mutate({
        email: email,
        code: data.otp
      }, {
        onSuccess: (tokenResponse) => {
          setResetToken(tokenResponse!);
          setOtp(data.otp);
          setStep(3);
          toast.success("Code verified successfully");
        }
      });
    };

    // Extract the original register methods to wrap the onChange
    const { onChange, ...otpRest } = register("otp");

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <span className="material-symbols-outlined text-3xl">lock_reset</span>
          </div>
          <p className="text-[#507395] dark:text-gray-400 text-sm">
            We sent a 6-digit code to <br />
            <span className="font-bold text-[#0e141b] dark:text-white text-base">{email}</span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="sr-only" htmlFor="otp">Verification Code</label>
          <div className="relative flex justify-center">
            <input
              {...otpRest}
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              // 1. Regex to block non-digits
              onChange={(e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
                onChange(e);
              }}
              // 2. Styling: Monospaced font + heavy letter spacing
              className="block w-full text-center text-4xl font-mono font-bold tracking-[0.5em] rounded-xl border-2 border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] py-4 text-[#0e141b] dark:text-white placeholder-gray-200 focus:border-[#4c99e6] focus:ring-0 focus:outline-none transition-all shadow-sm"
              style={{ textIndent: '0.5em' }} // visually centers the text because tracking adds space to the right of every char
            />
          </div>
          {errors.otp && <p className="text-red-500 text-sm font-medium mt-2 text-center">{errors.otp.message}</p>}
        </div>

        <button
          type="submit"
          disabled={resetPasswordValidateOtpMutation.isPending}
          className="w-full hover:cursor-pointer flex items-center justify-center rounded-xl bg-[#4c99e6] py-3.5 px-4 text-base font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-70 active:scale-[0.98]"
        >
          {resetPasswordValidateOtpMutation.isPending ? "Verifying..." : "Verify Code"}
        </button>

        <div className="text-center pt-2">
          <span className="text-sm text-[#507395] dark:text-gray-400">Didn't receive the code? </span>
          <button type="button" onClick={() => setStep(1)} className="hover: cursor-pointer text-sm font-bold text-[#4c99e6] hover:text-blue-600 hover:underline focus:outline-none transition-colors">
            Click to resend
          </button>
        </div>
      </form>
    );
  };

  // --- Step 3: Set New Password (Using Token) ---
  const Step3Form = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, watch, formState: { errors, isValid } } = useForm<Step3Data>({
      resolver: zodResolver(step3Schema),
      mode: "onChange"
    });

    const passwordValue = watch("password", "");

    const onSubmit = (data: Step3Data) => {
      // 1. Send the Token + New Password
      resetPasswordWithTokenMutation.mutate({
        token: resetToken, // The 32-char token from Step 2
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
              <span className="material-symbols-outlined text-[20px]">lock</span>
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
              <span className="material-symbols-outlined text-[20px]">lock</span>
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
                {showConfirmPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={!isValid || resetPasswordWithTokenMutation.isPending} className="w-full hover:cursor-pointer flex items-center justify-center rounded-lg bg-[#4c99e6] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#4c99e6] focus:ring-offset-2 transition-colors mt-2 disabled:opacity-70">
          {resetPasswordWithTokenMutation.isPending ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    );
  };

  return (
    <div className="bg-[#f6f7f8] dark:bg-[#111921] min-h-screen flex flex-col font-sans">
      {/* Header */}
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

      {/* Main Form Area */}
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
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}