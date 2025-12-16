import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { ApiResponse, TokenResponseDto } from "@/types/dtos";

export async function ALL(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const path = (await params).path.join("/");
  const url = `${process.env.NEXT_PUBLIC_API_URL}/${path}`; // Forward to .NET

  let body: any = undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      body = await request.json();
    } catch (e) {
    }
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  // 1. Attach Token from Cookie (Server-side read)
  const headers: any = {
    "Content-Type": "application/json",
  };
  
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    // 2. Replicate the request to .NET    
    const response = await axios({
      method: request.method,
      url: url,
      data: body,
      headers: headers,
      params: new URL(request.url).searchParams, // Forward query params
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    const cookieStore = await cookies();

    // 3. Handle Token Expiration (401)
    if (error.response?.status === 401) {
       const refreshToken = cookieStore.get("refreshToken")?.value;

       // If we don't have a refresh token, we can't save the session.
       if (!refreshToken) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
       }

       try {
         // A. Call .NET Backend to Refresh
         // Matches AuthController.cs -> [HttpPost("refresh")]
         const refreshResponse: ApiResponse<TokenResponseDto> = await axios.post(
           `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
           { refreshToken }
         );

         // Extract new tokens (checking structure from TokenResponseDto.cs)
         const { accessToken: newAccess, refreshToken: newRefresh } = refreshResponse.data as TokenResponseDto;

         // B. Retry the ORIGINAL Request with the new Access Token
         // We must update the Authorization header we prepared earlier
         headers["Authorization"] = `Bearer ${newAccess}`;

         const retryResponse = await axios({
            method: request.method,
            url: url, // The original .NET URL
            data: body,
            headers: headers,
            params: new URL(request.url).searchParams,
         });

         const nextResponse = NextResponse.json(retryResponse.data);

         const isProduction = process.env.NODE_ENV === "production";
         
         nextResponse.cookies.set("accessToken", newAccess, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            path: "/",
            maxAge: 15 * 60, // 15 mins
         });

         nextResponse.cookies.set("refreshToken", newRefresh, {
            httpOnly: true,
            secure: isProduction,
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, // 7 days
         });

         return nextResponse;

       } catch (refreshError) {
         return NextResponse.json({ error: "Session Expired" }, { status: 401 });
       }
    }
    return NextResponse.json(
      error.response?.data || { error: "Proxy Error" }, 
      { status: error.response?.status || 500 }
    );
  }
}