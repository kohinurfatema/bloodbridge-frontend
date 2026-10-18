import type { Role } from "@/types";

export interface JwtPayload {
  id: string;
  role: Role;
  exp: number;
  iat: number;
}

/**
 * Reads the payload of a JWT without verifying the signature.
 * Only used for routing decisions (expiry / role) — the backend
 * verifies the signature on every API call.
 */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** True if the token is missing, malformed or expires within `skewSeconds`. */
export function isTokenExpired(token: string | undefined, skewSeconds = 30) {
  if (!token) return true;
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}
