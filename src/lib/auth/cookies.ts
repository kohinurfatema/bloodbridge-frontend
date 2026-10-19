import type { NextResponse } from "next/server";

import { backendFetch } from "@/lib/api/backend-fetch";
import {
  ACCESS_TOKEN_COOKIE,
  API_URL,
  REFRESH_TOKEN_COOKIE,
  USER_COOKIE,
} from "@/lib/api/config";
import { decodeJwt } from "@/lib/auth/jwt";
import type { SessionUser } from "@/types";

const SEVEN_DAYS = 60 * 60 * 24 * 7;

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function accessMaxAge(token: string) {
  const exp = decodeJwt(token)?.exp;
  if (!exp) return 60 * 15;
  return Math.max(exp - Math.floor(Date.now() / 1000), 0);
}

export function setAccessCookie(res: NextResponse, accessToken: string) {
  res.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookie,
    maxAge: accessMaxAge(accessToken),
  });
}

export function setAuthCookies(
  res: NextResponse,
  data: { user: SessionUser; accessToken: string; refreshToken: string },
) {
  setAccessCookie(res, data.accessToken);
  res.cookies.set(REFRESH_TOKEN_COOKIE, data.refreshToken, {
    ...baseCookie,
    maxAge: SEVEN_DAYS,
  });
  setUserCookie(res, data.user);
}

export function setUserCookie(res: NextResponse, user: SessionUser) {
  res.cookies.set(USER_COOKIE, JSON.stringify(user), {
    ...baseCookie,
    maxAge: SEVEN_DAYS,
  });
}

export function clearAuthCookies(res: NextResponse) {
  for (const name of [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, USER_COOKIE]) {
    res.cookies.set(name, "", { ...baseCookie, maxAge: 0 });
  }
}

/** Exchanges a refresh token for a new access token. Returns null if it fails. */
export async function refreshAccessToken(refreshToken: string) {
  try {
    const res = await backendFetch(`${API_URL}/auth/refresh-token`, {
      method: "POST",
      retry: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { accessToken?: string } };
    return json.data?.accessToken ?? null;
  } catch {
    return null;
  }
}

export function parseUserCookie(value: string | undefined): SessionUser | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as SessionUser;
  } catch {
    return null;
  }
}
