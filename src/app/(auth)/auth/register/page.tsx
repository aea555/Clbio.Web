"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { registerSchema } from "@/lib/schemas/schemas";
import { useAuthMutations } from "@/hooks/use-mutations"; //
import { ApiResponse, ReadUserDto, TokenResponseDto } from "@/types/dtos";
import { useVerificationStore } from "@/store/use-verification-store";
import { getErrorMessage } from "@/lib/error-utils";

// 1. Extend the schema (Same as before)
const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerFormSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setVerificationContext } = useVerificationStore();
  
  // 2. Use the Mutation Hook
  const { registerMutation } = useAuthMutations();

  // 3. Setup Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  });

  // 4. Handle Submit
  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...payload } = data;

    registerMutation.mutateAsync(payload, {
      onSuccess: (response: ApiResponse<ReadUserDto>) => {
        const responseData = response.data;
        if (!responseData || !response.success) {
          toast.error("Registration failed. Please try again.");
          return;
        }

        const { id, email } = responseData;

        if (id && email){
          setVerificationContext(payload.email, payload.password);

          toast.success("Account created successfully! Please verify your email.");
          router.push("/auth/verify-email");    
        }
      },
      onError: (error: any) => {
        const msg = getErrorMessage(error);
        
        // Flow B: Account exists but unverified
        if (msg.includes("verify") || msg.includes("exists")) {
          setVerificationContext(payload.email); 
          toast.info("Account exists. Please verify your email.");
          router.push("/auth/verify-email");
          return;
        }
        
        toast.error(msg);
      },
    });
  };

  const isLoading = registerMutation.isPending;

  return (
    <div className="bg-[#f6f7f8] dark:bg-[#111921] min-h-screen flex flex-col font-sans">
      
      {/* Top Navigation */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e8edf3] dark:border-[#2d3a46] px-10 py-3 bg-white dark:bg-[#1a242f]">
        <div className="flex items-center gap-4 text-[#0e141b] dark:text-white">
          <div className="size-8 text-[#4c99e6]">
            {/* Logo SVG */}
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">ProjectFlow</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-[#507395] dark:text-gray-400 hidden sm:block">
            Already have an account?
          </span>
          <Link
            className="text-[#4c99e6] text-sm font-bold leading-normal tracking-[0.015em] hover:underline"
            href="/login"
          >
            Log in
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-[480px] bg-white dark:bg-[#1a242f] rounded-xl shadow-lg border border-[#e8edf3] dark:border-[#2d3a46] p-8 md:p-10">
          
          <div className="text-center mb-8">
            <h1 className="text-[#0e141b] dark:text-white tracking-tight text-[32px] font-bold leading-tight mb-2">
              Create an account
            </h1>
            <p className="text-[#507395] dark:text-gray-400 text-base font-normal leading-normal">
              Enter your details to get started.
            </p>
          </div>

          <button
            type="button"
            className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-white dark:bg-[#2d3a46] border border-[#e8edf3] dark:border-[#3e4d5d] hover:bg-gray-50 dark:hover:bg-[#364452] transition-colors text-[#0e141b] dark:text-white gap-3 mb-6 font-bold text-base tracking-[0.015em]"
            onClick={() => toast.info("Google Sign Up not implemented yet")}
          >
             {/* Google Icon SVG */}
            <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.52 12.2727C23.52 11.4242 23.4436 10.6061 23.3018 9.81818H12V14.4545H18.4582C18.18 15.9545 17.3291 17.2242 16.0636 18.0727V21.0818H19.9418C22.2109 18.9939 23.52 15.9212 23.52 12.2727Z" fill="#4285F4"></path>
              <path d="M12 24C15.24 24 17.9618 22.9273 19.9473 21.0873L16.0691 18.0782C14.9945 18.7964 13.62 19.2218 12 19.2218C8.87455 19.2218 6.22909 17.1109 5.28545 14.2745H1.27637V17.3836C3.25091 21.3055 7.31455 24 12 24Z" fill="#34A853"></path>
              <path d="M5.28545 14.2745C5.04545 13.5545 4.90909 12.7909 4.90909 12C4.90909 11.2091 5.04545 10.4455 5.28545 9.72545V6.61636H1.27637C0.463636 8.23636 0 10.0636 0 12C0 13.9364 0.463636 15.7636 1.27637 17.3836L5.28545 14.2745Z" fill="#FBBC05"></path>
              <path d="M12 4.77818C13.7618 4.77818 15.3382 5.38364 16.5818 6.57273L20.0236 3.13091C17.9564 1.20545 15.2345 0 12 0C7.31455 0 3.25091 2.69455 1.27637 6.61636L5.28545 9.72545C6.22909 6.88909 8.87455 4.77818 12 4.77818Z" fill="#EA4335"></path>
            </svg>
            <span>Sign up with Google</span>
          </button>

          <div className="relative flex items-center py-2 mb-6">
            <div className="flex-grow border-t border-[#e8edf3] dark:border-[#3e4d5d]"></div>
            <span className="flex-shrink-0 mx-4 text-[#507395] dark:text-gray-500 text-sm">
              or continue with email
            </span>
            <div className="flex-grow border-t border-[#e8edf3] dark:border-[#3e4d5d]"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#0e141b] dark:text-white" htmlFor="displayName">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#507395] dark:text-gray-500 group-focus-within:text-[#4c99e6]">
                  <span className="material-symbols-outlined text-[20px]">
                    {/* User Icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                </div>
                <input
                  {...register("displayName")}
                  id="displayName"
                  type="text"
                  placeholder="John Doe"
                  className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] pl-10 py-3 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] focus:outline-none sm:text-sm transition-colors shadow-sm"
                />
              </div>
              {errors.displayName && (
                <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#0e141b] dark:text-white" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#507395] dark:text-gray-500 group-focus-within:text-[#4c99e6]">
                  <span className="material-symbols-outlined text-[20px]">
                    {/* Mail Icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </span>
                </div>
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] pl-10 py-3 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] focus:outline-none sm:text-sm transition-colors shadow-sm"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#0e141b] dark:text-white" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#507395] dark:text-gray-500 group-focus-within:text-[#4c99e6]">
                  <span className="material-symbols-outlined text-[20px]">
                    {/* Lock Icon SVG */}
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                </div>
                <input
                  {...register("password")}
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] pl-10 pr-10 py-3 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] focus:outline-none sm:text-sm transition-colors shadow-sm"
                />
              </div>
              {errors.password && (
                 <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#0e141b] dark:text-white" htmlFor="confirm-password">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#507395] dark:text-gray-500 group-focus-within:text-[#4c99e6]">
                  <span className="material-symbols-outlined text-[20px]">
                     {/* Lock Icon SVG */}
                     <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                </div>
                <input
                  {...register("confirmPassword")}
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] pl-10 pr-10 py-3 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] focus:outline-none sm:text-sm transition-colors shadow-sm"
                />
              </div>
              {errors.confirmPassword && (
                 <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center rounded-lg bg-[#4c99e6] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#4c99e6] focus:ring-offset-2 transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
            
            <p className="text-xs text-center text-[#507395] dark:text-gray-400 mt-4 leading-relaxed px-4">
              By clicking "Create Account", you agree to our{" "}
              <Link className="font-medium text-[#4c99e6] hover:underline" href="/terms">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link className="font-medium text-[#4c99e6] hover:underline" href="/privacy">
                Privacy Policy
              </Link>.
            </p>
          </form>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-[#507395] dark:text-gray-500">
        <p>© 2024 ProjectFlow Inc. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <Link className="hover:underline" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="hover:underline" href="/terms">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}