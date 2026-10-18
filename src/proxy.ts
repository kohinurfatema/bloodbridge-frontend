import { type NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/api/config";
import {
  clearAuthCookies,
  refreshAccessToken,
  setAccessCookie,
} from "@/lib/auth/cookies";
import { decodeJwt, isTokenExpired } from "@/lib/auth/jwt";
import {
  canAccess,
  dashboardPath,
  isAuthPage,
  isProtected,
  LOGIN_PATH,
} from "@/lib/auth/routes";

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const session =
    refreshToken && !isTokenExpired(refreshToken, 0)
      ? decodeJwt(refreshToken)
      : null;

  // Not logged in: protected pages redirect to login and come back after.
  if (!session) {
    if (isProtected(pathname)) {
      const url = new URL(LOGIN_PATH, req.url);
      url.searchParams.set("redirect", `${pathname}${search}`);
      const res = NextResponse.redirect(url);
      if (refreshToken) clearAuthCookies(res);
      return res;
    }
    return NextResponse.next();
  }

  // Logged in: keep users out of login/register and route /dashboard by role.
  if (isAuthPage(pathname) || pathname === "/dashboard") {
    return NextResponse.redirect(new URL(dashboardPath(session.role), req.url));
  }

  // Wrong role for this section: send them to their own dashboard.
  if (!canAccess(pathname, session.role)) {
    const url = new URL(dashboardPath(session.role), req.url);
    url.searchParams.set("denied", "1");
    return NextResponse.redirect(url);
  }

  // Refresh an expired access token before Server Components render,
  // so server-side fetches in this same request already use the new one.
  if (isProtected(pathname) && isTokenExpired(req.cookies.get(ACCESS_TOKEN_COOKIE)?.value)) {
    const accessToken = await refreshAccessToken(refreshToken!);
    if (!accessToken) {
      const res = NextResponse.redirect(new URL(LOGIN_PATH, req.url));
      clearAuthCookies(res);
      return res;
    }
    req.cookies.set(ACCESS_TOKEN_COOKIE, accessToken);
    const res = NextResponse.next({ request: { headers: req.headers } });
    setAccessCookie(res, accessToken);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/payment/:path*", "/login", "/register"],
};
