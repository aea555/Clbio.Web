"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from "@react-oauth/google";

import { useAuthStore } from "@/store/use-auth-store";
import { useVerificationStore } from "@/store/use-verification-store";
import { useAuthMutations } from "@/hooks/use-mutations";
import { getErrorMessage } from "@/lib/error-utils";
import { apiClient } from "@/lib/axios-client";
import { ReadUserDto, ApiResponse } from "@/types/dtos";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setVerificationContext } = useVerificationStore();
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(false);

  // NEW: State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const { loginMutation, googleLoginMutation } = useAuthMutations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleLoginSuccess = async (tokenResponse: any) => {
    const tokens = tokenResponse.data || tokenResponse;

    try {
      const { data: userApiResponse } = await apiClient.get<ApiResponse<ReadUserDto>>("/api/proxy/users/me");
      const userData = userApiResponse.data!;

      setUser({ ...tokens, ...userData });

      toast.success(`Welcome back, ${userData.displayName}!`);
      router.push("/dashboard");

    } catch (err) {
      console.error("Profile fetch failed during login", err);
      toast.error("Login successful, but failed to load user profile.");
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    loginMutation.mutate(data, {
      onSuccess: (response) => handleLoginSuccess(response),
      onError: (error: any) => {
        const msg = getErrorMessage(error);
        if (msg.toLowerCase().includes("verify") || msg.toLowerCase().includes("not verified")) {
          setVerificationContext(data.email);
          toast.error("Account requires verification.");
          router.push("/auth/verify-email");
          return;
        }
        toast.error(msg);
      },
      onSettled: () => setIsLoading(false)
    });
  };

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google login failed to retrieve credentials.");
      return;
    }

    googleLoginMutation.mutate(
      { idToken: credentialResponse.credential },
      {
        onSuccess: (response) => handleLoginSuccess(response),
      }
    );
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
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
            <span className="text-sm font-medium text-[#507395] dark:text-gray-400 hidden sm:block">
              Don't have an account?
            </span>
            <Link
              className="text-[#4c99e6] text-sm font-bold leading-normal tracking-[0.015em] hover:underline"
              href="/auth/register"
            >
              Sign up
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-[480px] bg-white dark:bg-[#1a242f] rounded-xl shadow-lg border border-[#e8edf3] dark:border-[#2d3a46] p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-[#0e141b] dark:text-white tracking-tight text-[32px] font-bold leading-tight mb-2">
                Welcome back
              </h1>
              <p className="text-[#507395] dark:text-gray-400 text-base font-normal leading-normal">
                Please enter your details to sign in.
              </p>
            </div>

            {/* Google Login Button */}
            <div className="flex justify-center mb-6 w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google Login Failed")}
                theme="outline"
                size="large"
                width="300"
                text="signin_with"
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
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#0e141b] dark:text-white" htmlFor="email">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#507395] dark:text-gray-500 group-focus-within:text-[#4c99e6]">
                    <span className="material-symbols-outlined text-[20px]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-[#0e141b] dark:text-white" htmlFor="password">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#507395] dark:text-gray-500 group-focus-within:text-[#4c99e6]">
                    <span className="material-symbols-outlined text-[20px]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </span>
                  </div>

                  <input
                    {...register("password")}
                    id="password"
                    // FIX: Toggle Type
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-[#e8edf3] dark:border-[#3e4d5d] bg-white dark:bg-[#111921] pl-10 pr-10 py-3 text-[#0e141b] dark:text-white placeholder-gray-400 focus:border-[#4c99e6] focus:ring-1 focus:ring-[#4c99e6] focus:outline-none sm:text-sm transition-colors shadow-sm"
                  />

                  {/* FIX: Add Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#507395] dark:text-gray-500 hover:text-[#0e141b] dark:hover:text-gray-300 focus:outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      /* Eye Off Icon */
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" />
                      </svg>
                    ) : (
                      /* Eye Icon */
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
                <div className="flex justify-end pt-1">
                  <Link
                    className="text-sm font-medium text-[#4c99e6] hover:text-[#4c99e6]/80 transition-colors"
                    href="/auth/forgot-password"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || loginMutation.isPending}
                className="w-full flex items-center justify-center rounded-lg bg-[#4c99e6] py-3 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#4c99e6] focus:ring-offset-2 transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </GoogleOAuthProvider>
  );
}