import { NextResponse } from "next/server";

import { clearAuthCookies } from "@/lib/auth/cookies";

export function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out", data: {} });
  clearAuthCookies(res);
  return res;
}
