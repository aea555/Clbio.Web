import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { LoginRequestDto } from "@/lib/schemas/schemas";
import { ApiResponse, TokenResponseDto } from "@/types/dtos";

export async function POST(request: Request) {
  const body: LoginRequestDto = await request.json();

  try {
    // 1. Call .NET Backend
    const resp: ApiResponse<TokenResponseDto> = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      body
    );
    
    // 2. Extract Tokens 
    const { accessToken, refreshToken } = resp.data as TokenResponseDto;

    // 3. Set HttpOnly Cookies
    const cookieStore = await cookies();
    
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 15 * 60, 
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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