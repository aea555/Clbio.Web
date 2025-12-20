import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios, { AxiosResponse } from "axios";
import { ApiResponse, TokenResponseDto } from "@/types/dtos";

async function handle(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path.join("/");
  const url = `${process.env.NEXT_PUBLIC_API_URL}/${path}`;

  // 1. DYNAMIC BODY & HEADER HANDLING
  const incomingContentType = request.headers.get("content-type") || "";
  const isMultipart = incomingContentType.includes("multipart/form-data");

  let body: any = undefined;
  const headers: any = {};

  if (request.method !== "GET" && request.method !== "HEAD") {
    if (isMultipart) {
      // FIX A: For files, read as ArrayBuffer to preserve binary data
      // This allows us to re-use the 'body' variable if we need to retry on 401
      body = await request.arrayBuffer();
      
      // FIX B: Pass the exact Content-Type header from the client.
      // This is crucial because it contains the 'boundary=...' string.
      headers["Content-Type"] = incomingContentType;
      
      // Optional: Pass content-length if available
      if (request.headers.has("content-length")) {
        headers["Content-Length"] = request.headers.get("content-length");
      }
    } else {
      // Existing logic for JSON
      try {
        const text = await request.text();
        if (text) body = JSON.parse(text);
        headers["Content-Type"] = "application/json";
      } catch (e) {
        // Body empty
      }
    }
  }

  const cookieStore = await cookies();
  let newAccess = cookieStore.get("accessToken")?.value;

  if (newAccess) {
    headers["Authorization"] = `Bearer ${newAccess}`;
  }

  try {
    // 2. Forward Request
    const response = await axios({
      method: request.method,
      url: url,
      data: body, // Axios handles ArrayBuffer correctly
      headers: headers,
      params: new URL(request.url).searchParams,
      // Increase limit for uploads
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    
    // 3. Handle 401 (Refresh Logic)
    if (error.response?.status === 401) {
       const cookieStore = await cookies();
       let newRefresh = cookieStore.get("refreshToken")?.value;

       if (!newRefresh) {
         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
       }

       try {
         const refreshResponse: AxiosResponse<ApiResponse<TokenResponseDto>> = await axios.post(
           `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
           { refreshToken: newRefresh }
         );

         const apiResponse = refreshResponse.data;
         const { accessToken, refreshToken } = apiResponse.data || {};

         if (!accessToken || !refreshToken) {
            return NextResponse.json({ error: "Invalid Token Response" }, { status: 500 });
         }
         newAccess = accessToken;
         newRefresh = refreshToken;

         // B. Retry Original Request
         headers["Authorization"] = `Bearer ${newAccess}`;

         const retryResponse = await axios({
            method: request.method,
            url: url,
            data: body, // Reuse the ArrayBuffer body
            headers: headers,
            params: new URL(request.url).searchParams,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
         });

         const nextResponse = NextResponse.json(retryResponse.data);

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
         const response = NextResponse.json(
           { error: "Session Expired. Please login again." }, 
           { status: 401 }
         );
         response.cookies.delete("accessToken");
         response.cookies.delete("refreshToken");
         return response;
       }
    }

    return NextResponse.json(
      error.response?.data || { error: "Proxy Error" }, 
      { status: error.response?.status || 500 }
    );
  }
}

export { handle as GET, handle as POST, handle as PUT, handle as DELETE, handle as PATCH };