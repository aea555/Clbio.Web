import { apiClient } from "@/lib/axios-client";
import {
  LoginRequestDto as LoginRequest,
  RegisterRequestDto,
  ForgotPasswordRequestDto,
  VerifyEmailOtpRequestDto,
  ResendVerificationOtpRequestDto,
  GoogleLoginRequestDto,
  ResetPasswordValidateOtpDto,
  ResetPasswordWithTokenDto
} from "@/lib/schemas/schemas"; // <--- Updated import path
import { post } from "@/lib/service-factory";
import { ReadUserDto, TokenResponseDto, ApiResponse } from "@/types/dtos";

export const authService = {
  /**
   * 1. LOGIN
   * Calls Next.js Route -> Calls .NET -> Sets HttpOnly Cookies
   * Then fetches the User Profile immediately.
   */
  login: async (credentials: LoginRequest): Promise<ReadUserDto> => {
    // A. Perform the Login (Sets Cookies)
    await apiClient.post("/api/auth/login", credentials);

    // B. Fetch User Details (Since TokenResponseDto doesn't have them)
    // This goes to /api/proxy/users/me -> .NET /api/users/me
    return authService.getMe();
  },

  /**
   * 2. REGISTER
   * Standard call. .NET returns { success: true, message: "..." }
   */
  register: async (data: RegisterRequestDto) => {
    const response = await apiClient.post<ApiResponse<ReadUserDto>>("/api/proxy/auth/register", data);
    return response.data;
  },

  /**
   * 3. LOGOUT
   * Calls Next.js Route -> Clears Cookies -> Calls .NET Logout
   */
  logout: async () => {
    await apiClient.post("/api/auth/logout");
  },

  /**
   * 4. GET CURRENT USER
   * Used to hydrate the AuthStore on page load or after login
   */
  getMe: async (): Promise<ReadUserDto> => {
    const response = await apiClient.get<ApiResponse<ReadUserDto>>("/api/proxy/users/me");
    return response.data.data as ReadUserDto; // .value comes from your ApiResponse wrapper
  },

  /**
   * 5. GOOGLE LOGIN
   */
  googleLogin: async (data: GoogleLoginRequestDto) => {
    // POST /api/auth/google-login
    const response = await apiClient.post<ApiResponse<TokenResponseDto>>("/api/auth/google", data);
    return response.data.data;
  },

  /**
   * 6. PASSWORD RECOVERY
   */
  forgotPassword: async (data: ForgotPasswordRequestDto) => {
    // AllowAnonymous in backend
    return apiClient.post("/api/proxy/auth/forgot-password", data);
  },

  resetPasswordValidateOtp: async (data: ResetPasswordValidateOtpDto) => {
    return post<string>("/api/proxy/auth/reset-password-validate-otp", data);
  },

  resetPasswordWithToken: async (data: ResetPasswordWithTokenDto) => {
    return post<string>("/api/proxy/auth/reset-password-with-token", data);
  },

  /**
   * 7. EMAIL VERIFICATION
   */
  verifyEmail: async (data: VerifyEmailOtpRequestDto) => {
    return apiClient.post("/api/proxy/auth/verify-email", data);
  },

  resendVerification: async (data: ResendVerificationOtpRequestDto) => {
    return apiClient.post(`/api/proxy/auth/resend-verification-otp`, data);
  }
};