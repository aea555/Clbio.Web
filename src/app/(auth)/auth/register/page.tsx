"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from "@react-oauth/google";

import { registerSchema } from "@/lib/schemas/schemas";
import { useAuthMutations } from "@/hooks/use-mutations";
import { ApiResponse, ReadUserDto } from "@/types/dtos";
import { useVerificationStore } from "@/store/use-verification-store";
import { getErrorMessage } from "@/lib/error-utils";
import { useAuthStore } from "@/store/use-auth-store";
import { apiClient } from "@/lib/axios-client";
import { PasswordRequirements } from "@/components/auth/password-requirements";

// 1. Extend the schema
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
  const setUser = useAuthStore((state) => state.setUser);

  // State for toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2. Use Mutation Hooks
  const { registerMutation, googleLoginMutation } = useAuthMutations();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    mode: "onChange"
  });

  const passwordValue = watch("password", "");

  // --- GOOGLE SUCCESS HANDLER ---
  // Since Google Auth auto-verifies and logs in, we redirect straight to dashboard
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google sign-up failed.");
      return;
    }

    googleLoginMutation.mutate(
      { idToken: credentialResponse.credential },
      {
        onSuccess: async (tokenResponse: any) => {
          const tokens = tokenResponse.data || tokenResponse;
          try {
            // Fetch User Profile
            const { data: userApiResponse } = await apiClient.get<ApiResponse<ReadUserDto>>("/api/proxy/users/me");
            const userData = userApiResponse.data!;

            // Update Store
            setUser({ ...tokens, ...userData });

            toast.success(`Account created! Welcome, ${userData.displayName}!`);
            router.push("/dashboard");
          } catch (err) {
            console.error("Profile fetch failed", err);
            toast.error("Sign up successful, but failed to load profile.");
          }
        },
        onError: (error: any) => {
          const msg = getErrorMessage(error);
          toast.error(msg);
        }
      }
    );
  };

  // --- STANDARD REGISTER SUBMIT ---
  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...payload } = data;

    registerMutation.mutate(payload, {
      onSuccess: (response: ApiResponse<ReadUserDto>) => {
        const responseData = response.data;
        if (!responseData || !response.success) {
          toast.error("Registration failed.");
          return;
        }

        const { id, email } = responseData;

        if (id && email) {
          setVerificationContext(payload.email, payload.password);
          toast.success("Account created successfully! Please verify your email.");
          router.push("/auth/verify-email");
        }
      },
      onError: (error: any) => {
        const msg = getErrorMessage(error);
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

  const isLoading = registerMutation.isPending || googleLoginMutation.isPending;
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
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
            <span className="text-sm font-medium text-[#507395] dark:text-gray-400 hidden sm:block">
              Already have an account?
            </span>
            <Link
              className="text-[#4c99e6] text-sm font-bold leading-normal tracking-[0.015em] hover:underline"
              href="/auth/login"
            >
              Log in
            </Link>
          </div>
        </header>

        {/* Main Content */}
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

            {/* Google Sign Up */}
            <div className="flex justify-center mb-6 w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Sign Up Failed")}
                theme="outline"
                size="large"
                width="300"
                text="signup_with" // Shows "Sign up with Google"
                shape="rectangular"
              />
            </div>

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
                    <span className="material-symbols-outlined text-[20px]">person</span>
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
                    <span className="material-symbols-outlined text-[20px]">mail</span>
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
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] pl-10 pr-10 py-3 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] focus:outline-none sm:text-sm transition-colors shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#507395] dark:text-gray-500 hover:text-[#0e141b] dark:hover:text-gray-300 focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                <PasswordRequirements value={passwordValue} />

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
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input
                    {...register("confirmPassword")}
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] pl-10 pr-10 py-3 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] focus:outline-none sm:text-sm transition-colors shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#507395] dark:text-gray-500 hover:text-[#0e141b] dark:hover:text-gray-300 focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isValid || isLoading}
                className="w-full flex items-center justify-center rounded-lg bg-[#4c99e6] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#4c99e6] focus:ring-offset-2 transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}