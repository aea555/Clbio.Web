"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthMutations } from "@/hooks/use-mutations";
import { useVerificationStore } from "@/store/use-verification-store";
import { useAuthStore } from "@/store/use-auth-store";

// --- Schemas ---
const emailStepSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpStepSchema = z.object({
  otp: z.string().length(6, "Code must be exactly 6 digits"),
});

type EmailStepData = z.infer<typeof emailStepSchema>;
type OtpStepData = z.infer<typeof otpStepSchema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  
  // Store State (from Register/Login)
  const { email: storeEmail, password, setVerificationContext, clearVerificationContext } = useVerificationStore();
  
  // Local UI State
  const [step, setStep] = useState<"EMAIL_INPUT" | "OTP_INPUT">("EMAIL_INPUT");
  const [targetEmail, setTargetEmail] = useState<string>("");

  const { verifyEmailMutation, loginMutation, resendVerificationMutation } = useAuthMutations();

  // 1. Init: If we have an email from the store, go straight to OTP step
  useEffect(() => {
    if (storeEmail) {
      setTargetEmail(storeEmail);
      setStep("OTP_INPUT");
    }
  }, [storeEmail]);

  // 2. Cleanup on leave
  useEffect(() => {
    return () => clearVerificationContext();
  }, [clearVerificationContext]);

  // --- Step 1 Form (Email) ---
  const EmailForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<EmailStepData>({
      resolver: zodResolver(emailStepSchema),
    });

    const onSendCode = (data: EmailStepData) => {
      // Trigger Resend API to send the code
      resendVerificationMutation.mutate({email: data.email}, {
        onSuccess: () => {
          setTargetEmail(data.email);
          setStep("OTP_INPUT");
          // Update store context just in case (without password)
          setVerificationContext(data.email); 
          toast.success("If an account with that email exists and is not already verified, a verification code has been resent successfully.");
        }
      });
    };

    return (
      <form onSubmit={handleSubmit(onSendCode)} className="space-y-6">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#0e141b] dark:text-white" htmlFor="email">
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="name@company.com"
            className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] py-3 px-4 text-[#0e141b] dark:text-white focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] outline-none transition-colors"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <button
          type="submit"
          disabled={resendVerificationMutation.isPending}
          className="w-full rounded-lg bg-[#4c99e6] py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none transition-colors disabled:opacity-70"
        >
          {resendVerificationMutation.isPending ? "Sending..." : "Send Verification Code"}
        </button>
      </form>
    );
  };

  // --- Step 2 Form (OTP) ---
  const OtpForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<OtpStepData>({
      resolver: zodResolver(otpStepSchema),
    });

    const onVerify = (data: OtpStepData) => {
      verifyEmailMutation.mutate({ email: targetEmail, otp: data.otp }, {
        onSuccess: () => {
          toast.success("Email verified successfully!");

          // Auto-Login Check (Only if password exists AND email matches)
          if (password && targetEmail === storeEmail) {
            toast.loading("Logging you in...");
            loginMutation.mutate({ email: targetEmail, password }, {
              onSuccess: (user) => {
                setUser(user);
                toast.dismiss();
                clearVerificationContext(); 
                router.push("/dashboard");
              },
              onError: () => {
                toast.dismiss();
                clearVerificationContext();
                router.push("/auth/login");
              }
            });
          } else {
            // Manual Login Fallback
            clearVerificationContext();
            toast.info("Verification complete. Please log in.");
            router.push("/auth/login");
          }
        }
      });
    };

    return (
      <form onSubmit={handleSubmit(onVerify)} className="space-y-6">
         <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#0e141b] dark:text-white text-center" htmlFor="otp">
              Verification Code
            </label>
            <input
              {...register("otp")}
              id="otp"
              type="text"
              maxLength={6}
              placeholder="123456"
              className="block w-full text-center text-3xl font-bold tracking-[0.5em] rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] py-4 text-[#0e141b] dark:text-white placeholder-gray-300 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] outline-none transition-colors"
            />
            {errors.otp && <p className="text-red-500 text-center text-xs mt-1">{errors.otp.message}</p>}
          </div>

          <button
            type="submit"
            disabled={verifyEmailMutation.isPending || loginMutation.isPending}
            className="w-full rounded-lg bg-[#4c99e6] py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none transition-colors disabled:opacity-70"
          >
            {(verifyEmailMutation.isPending || loginMutation.isPending) ? "Verifying..." : "Verify & Continue"}
          </button>

          <div className="text-center mt-4">
             <button 
               type="button"
               onClick={() => setStep("EMAIL_INPUT")}
               className="text-sm text-[#507395] dark:text-gray-400 hover:text-[#4c99e6] transition-colors"
             >
               Change email address?
             </button>
          </div>
      </form>
    );
  };

  return (
    <div className="bg-[#f6f7f8] dark:bg-[#111921] min-h-screen flex flex-col font-sans">
      <header className="flex items-center justify-between border-b border-[#e8edf3] dark:border-[#2d3a46] px-10 py-3 bg-white dark:bg-[#1a242f]">
        <div className="flex items-center gap-4 text-[#0e141b] dark:text-white">
          <div className="size-8 text-[#4c99e6]">
             <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fillRule="evenodd"></path>
             </svg>
          </div>
          <h2 className="text-lg font-bold">ProjectFlow</h2>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm text-[#507395] dark:text-gray-400">Already verified?</span>
           <button onClick={() => router.push("/auth/login")} className="text-sm font-bold text-[#4c99e6] hover:underline">
             Sign in
           </button>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-[480px] bg-white dark:bg-[#1a242f] rounded-xl shadow-lg border border-[#e8edf3] dark:border-[#2d3a46] p-8">
          
          <div className="text-center mb-8">
            <h1 className="text-[#0e141b] dark:text-white text-[32px] font-bold mb-2">
              {step === "EMAIL_INPUT" ? "Verify your email" : "Check your email"}
            </h1>
            <p className="text-[#507395] dark:text-gray-400">
              {step === "EMAIL_INPUT" 
                ? "Enter your email address to verify your account." 
                : <span>We sent a 6-digit code to <span className="font-semibold text-[#0e141b] dark:text-white">{targetEmail}</span></span>
              }
            </p>
          </div>

          {step === "EMAIL_INPUT" ? <EmailForm /> : <OtpForm />}
          
        </div>
      </main>
    </div>
  );
}