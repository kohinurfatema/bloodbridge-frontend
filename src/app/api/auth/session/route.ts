import { NextResponse } from "next/server";

import { ApiError } from "@/lib/api/client";
import { serverApi } from "@/lib/api/server";
import { setUserCookie } from "@/lib/auth/cookies";
import { getSession } from "@/lib/auth/session";
import type { User } from "@/types";

export async function GET() {
  const user = await getSession();
  return NextResponse.json({ success: true, message: "Session", data: { user } });
}

/**
 * Re-syncs the session cookie with the backend after a profile edit.
 * The user is re-read from /users/me, so the client can't set its own role.
 */
export async function POST() {
  try {
    const me = await serverApi<User>("/users/me");
    const user = { id: me.id, name: me.name, email: me.email, role: me.role };
    const res = NextResponse.json({ success: true, message: "Session refreshed", data: { user } });
    setUserCookie(res, user);
    return res;
  } catch (error) {
    const status = error instanceof ApiError ? error.status || 502 : 502;
    return NextResponse.json(
      { success: false, message: "Could not refresh session", errors: [] },
      { status },
    );
  }
}
