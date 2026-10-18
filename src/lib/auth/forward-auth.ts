import { NextResponse } from "next/server";

import { API_URL } from "@/lib/api/config";
import { setAuthCookies } from "@/lib/auth/cookies";
import type { ApiFailure, ApiSuccess, AuthResult } from "@/types";

/**
 * Sends credentials to the backend and, on success, stores the tokens in
 * httpOnly cookies. Only the user object is returned to the browser.
 */
export async function forwardAuth(endpoint: "login" | "register", req: Request) {
  let json: ApiSuccess<AuthResult> | ApiFailure;
  let status: number;

  try {
    const res = await fetch(`${API_URL}/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await req.text(),
      cache: "no-store",
    });
    status = res.status;
    json = await res.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Could not reach the BloodBridge API", errors: [] },
      { status: 502 },
    );
  }

  if (!json.success) {
    return NextResponse.json(json, { status });
  }

  const { user, accessToken, refreshToken } = json.data;
  const sessionUser = { id: user.id, name: user.name, email: user.email, role: user.role };

  const res = NextResponse.json(
    { success: true, message: json.message, data: { user: sessionUser } },
    { status },
  );
  setAuthCookies(res, { user: sessionUser, accessToken, refreshToken });
  return res;
}
