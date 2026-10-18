import "server-only";

import { cookies } from "next/headers";

import { REFRESH_TOKEN_COOKIE, USER_COOKIE } from "@/lib/api/config";
import { parseUserCookie } from "@/lib/auth/cookies";
import type { SessionUser } from "@/types";

/**
 * Returns the logged-in user for Server Components and Route Handlers.
 * A session exists as long as the refresh token is still valid.
 */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  if (!store.get(REFRESH_TOKEN_COOKIE)?.value) return null;
  return parseUserCookie(store.get(USER_COOKIE)?.value);
}
