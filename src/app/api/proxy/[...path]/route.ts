import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios, { AxiosError, AxiosResponse } from "axios";
import { ApiResponse, TokenResponseDto } from "@/types/dtos";

async function handle(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path.join("/");
  const url = `${process.env.NEXT_PUBLIC_API_URL}/${path}`;

  let body: any = undefined;
  // Parse body only for non-GET requests
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      const text = await request.text();
      if (text) body = JSON.parse(text);
    } catch (e) {
      // Body might be empty
    }
  }

  const cookieStore = await cookies();
  let newAccess = cookieStore.get("accessToken")?.value;

  const headers: any = {
    "Content-Type": "application/json",
  };
  
  // Only attach token if it exists (Does not assume route is protected)
  if (newAccess) {
    headers["Authorization"] = `Bearer ${newAccess}`;
  }

  try {
    // 2. Forward Request to .NET
    const response = await axios({
      method: request.method,
      url: url,
      data: body,
      headers: headers,
      params: new URL(request.url).searchParams,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    
    // 3. Handle 401 
    if (error.response?.status === 401) {
       const cookieStore = await cookies();
       let newRefresh = cookieStore.get("refreshToken")?.value;

       // If no refresh token, fail immediately
       if (!newRefresh) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
       }

       try {
         // A. Attempt Refresh
         const refreshResponse: AxiosResponse<ApiResponse<TokenResponseDto>> = await axios.post(
           `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
           { refreshToken: newRefresh }
         );

         const apiResponse = refreshResponse.data;
         const { accessToken, refreshToken } = apiResponse.data || {};

         if (!accessToken || !refreshToken) {
            console.error("Login successful but some tokens are not found in response:", apiResponse);
            return NextResponse.json({ error: "Invalid Token Response" }, { status: 500 });
         }
         newAccess = accessToken;
         newRefresh = refreshToken;

         // B. Retry Original Request
         headers["Authorization"] = `Bearer ${newAccess}`;

         const retryResponse = await axios({
            method: request.method,
            url: url,
            data: body,
            headers: headers,
            params: new URL(request.url).searchParams,
         });

         const nextResponse = NextResponse.json(retryResponse.data);

         // C. Update Cookies
         const isProduction = process.env.NODE_ENV === "production";
         const isSecure = isProduction && !request.url.includes("localhost");
         
         nextResponse.cookies.set("accessToken", newAccess, {
            httpOnly: true,
            secure: isSecure,
            sameSite: "lax",
            path: "/",
            maxAge: 15 * 60, 
         });

         nextResponse.cookies.set("refreshToken", newRefresh, {
            httpOnly: true,
            secure: isSecure,
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60, 
         });

         return nextResponse;

       } catch (refreshError) {
         // D. CRITICAL: Refresh Failed - Clear Session
         const response = NextResponse.json(
           { error: "Session Expired. Please login again." }, 
           { status: 401 }
         );

         // Remove Authentication Cookies
         response.cookies.delete("accessToken");
         response.cookies.delete("refreshToken");

         return response;
       }
    }

    // Pass through other errors (400, 403, 500)
    return NextResponse.json(
      error.code || { error: "Proxy Error" }, 
      { status: error.response?.status || 500 }
    );
  }
}

// Export supported methods
export { handle as GET, handle as POST, handle as PUT, handle as DELETE, handle as PATCH };