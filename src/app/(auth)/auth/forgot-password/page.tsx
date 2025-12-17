"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthMutations } from "@/hooks/use-mutations";

// --- Schemas ---
const step1Schema = z.object({
  email: z.string().email("Invalid email address"),
});

const step2Schema = z.object({
  otp: z.string().length(6, "Code must be 6 digits"),
});

const step3Schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
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
    const { register, handleSubmit, formState: { errors } } = useForm<Step3Data>({
      resolver: zodResolver(step3Schema)
    });

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
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
               </span>
            </div>
            <input {...register("password")} id="password" type="password" placeholder="••••••••" className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] pl-10 pr-10 py-3 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] focus:outline-none sm:text-sm transition-colors shadow-sm" />
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#0e141b] dark:text-white" htmlFor="confirm-password">Confirm Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#507395] dark:text-gray-500 group-focus-within:text-[#4c99e6]">
               <span className="material-symbols-outlined text-[20px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
               </span>
            </div>
            <input {...register("confirmPassword")} id="confirm-password" type="password" placeholder="••••••••" className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] pl-10 pr-10 py-3 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] focus:outline-none sm:text-sm transition-colors shadow-sm" />
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={resetPasswordMutation.isPending} className="w-full flex items-center justify-center rounded-lg bg-[#4c99e6] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#4c99e6] focus:ring-offset-2 transition-colors mt-2 disabled:opacity-70">
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
          <div className="size-8 text-[#4c99e6]">
             <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fillRule="evenodd"></path>
             </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">ProjectFlow</h2>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-[#507395] dark:text-gray-500">
        <div className="mt-2 space-x-4">
          <Link className="hover:underline" href="/privacy">Privacy Policy</Link>
          <Link className="hover:underline" href="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}