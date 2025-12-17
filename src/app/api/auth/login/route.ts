import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { LoginRequestDto } from "@/lib/schemas/schemas";
import { ApiResponse, TokenResponseDto } from "@/types/dtos";

export async function POST(request: Request) {
  const body: LoginRequestDto = await request.json();

  try {
    // 1. Call .NET Backend
    const resp = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      body
    );
    
    const apiResponse = resp.data as ApiResponse<TokenResponseDto>;

    if (!apiResponse.success) {
      console.error("Login failed:", apiResponse);
      return NextResponse.json(
        { error: apiResponse.error || "Login failed" },
        { status: 401 }
      );
    }

    // 2. Extract Tokens 
    const { accessToken, refreshToken } = apiResponse.data || {};

    if (!accessToken || !refreshToken) {
      console.error("Login successful but some tokens are not found in response:", apiResponse);
      return NextResponse.json({ error: "Invalid Token Response" }, { status: 500 });
    }

    // 3. Set HttpOnly Cookies
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === "production";
    const isSecure = isProduction && !request.url.includes("localhost");

    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60, 
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, 
    });

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.error || "Login failed" },
      { status: error.response?.status || 500 }
    );
  }
}