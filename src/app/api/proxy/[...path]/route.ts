import { type NextRequest, NextResponse } from "next/server";

import {
  ACCESS_TOKEN_COOKIE,
  API_URL,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/api/config";
import {
  clearAuthCookies,
  refreshAccessToken,
  setAccessCookie,
} from "@/lib/auth/cookies";
import { isTokenExpired } from "@/lib/auth/jwt";

function callBackend(
  url: string,
  req: NextRequest,
  body: string | undefined,
  token: string | undefined,
) {
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  return fetch(url, { method: req.method, headers, body, cache: "no-store" });
}

async function forward(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const url = `${API_URL}/${path.join("/")}${req.nextUrl.search}`;
  const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.text();

  let token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  let refreshedToken: string | null = null;

  // Access tokens live 15 minutes; refresh before the call if it has expired.
  if (refreshToken && isTokenExpired(token)) {
    refreshedToken = await refreshAccessToken(refreshToken);
    token = refreshedToken ?? undefined;
  }

  try {
    let res = await callBackend(url, req, body, token);

    // Token rejected (e.g. secret rotated) — try one refresh and retry.
    if (res.status === 401 && refreshToken && !refreshedToken) {
      refreshedToken = await refreshAccessToken(refreshToken);
      if (refreshedToken) {
        res = await callBackend(url, req, body, refreshedToken);
      }
    }

    const out = new NextResponse(res.body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/json",
      },
    });

    if (refreshedToken) {
      setAccessCookie(out, refreshedToken);
    } else if (refreshToken && res.status === 401) {
      // Refresh token is no longer valid: end the session.
      clearAuthCookies(out);
    }

    return out;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Could not reach the BloodBridge API",
        errors: [],
      },
      { status: 502 },
    );
  }
}

export {
  forward as GET,
  forward as POST,
  forward as PUT,
  forward as PATCH,
  forward as DELETE,
};
