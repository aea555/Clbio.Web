import { apiClient } from "@/lib/axios-client";
import { 
  LoginRequestDto as LoginRequest, 
  RegisterRequestDto, 
  ForgotPasswordRequestDto, 
  ResetPasswordRequestDto,
  VerifyEmailOtpRequestDto,
  ResendVerificationOtpRequestDto
} from "@/lib/schemas/schemas"; // <--- Updated import path
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
    // Assuming you have an endpoint like [HttpGet("me")] in UserController
    // If not, we might need to rely on decoding the token, but fetching is safer.
    const response = await apiClient.get<ApiResponse<ReadUserDto>>("/api/proxy/users/me");
    return response.data.data as ReadUserDto; // .value comes from your ApiResponse wrapper
  },

  /**
   * 5. GOOGLE LOGIN
   */
  loginWithGoogle: async (idToken: string): Promise<ReadUserDto> => {
    // Similar to standard login, but sends the Google ID Token
    await apiClient.post("/api/auth/google", { idToken });
    return authService.getMe();
  },

  /**
   * 6. PASSWORD RECOVERY
   */
  forgotPassword: async (data: ForgotPasswordRequestDto) => {
    // AllowAnonymous in backend
    return apiClient.post("/api/proxy/auth/forgot-password", data);
  },

  resetPassword: async (data: ResetPasswordRequestDto) => {
    // AllowAnonymous in backend
    return apiClient.post("/api/proxy/auth/reset-password", data);
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