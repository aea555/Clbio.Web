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
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl fill-1">grid_view</span>
            <span className="text-xl font-black tracking-tighter text-foreground uppercase">Clbio</span>
          </div>
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