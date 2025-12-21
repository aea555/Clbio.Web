import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { ApiResponse, TokenResponseDto } from "@/types/dtos";

export async function POST(request: Request) {
  type GoogleLoginRequestDto = { idToken: string };

  const body: GoogleLoginRequestDto = await request.json();

  try {
    const resp = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
      body
    );
    
    const apiResponse = resp.data as ApiResponse<TokenResponseDto>;

    if (!apiResponse.success) {
      console.error("Google Login failed:", apiResponse);
      return NextResponse.json(
        { error: apiResponse.error || "Google Login failed" },
        { status: 401 }
      );
    }

    const { accessToken, refreshToken } = apiResponse.data || {};

    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: "Invalid Token Response" }, { status: 500 });
    }

    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";
    const isSecure = isProduction && !request.url.includes("localhost");

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, // 15 mins
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json(apiResponse);
    
  } catch (error: any) {
    console.error("Google Auth Route Error:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data?.error || "Google Login failed" },
      { status: error.response?.status || 500 }
    );
  }
}