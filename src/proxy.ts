import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

const intlMiddleware = createIntlMiddleware({
  locales: ["en", "tr"],
  defaultLocale: "en",
  localePrefix: "always"
});

export function proxy(request: NextRequest) {
  const response = intlMiddleware(request);
  if (response) return response;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const { pathname } = request.nextUrl;

  const locale = pathname.split('/')[1];

  const authRoutes = [`/${locale}/auth`];
  const protectedRoutes = [`/${locale}/dashboard`];

  // 1. Define Protected Routes
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // 2. Redirect Unauthenticated Users
  if (isProtectedRoute && !accessToken && !refreshToken) {
    const loginUrl = new URL(`/${locale}/auth/login`, request.url);
    loginUrl.searchParams.set("returnUrl", pathname); 
    return NextResponse.redirect(loginUrl);
  }

  // 3. Redirect Authenticated Users away from Login
  if (isAuthRoute && (accessToken || refreshToken)) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sounds).*)',
  ],
};