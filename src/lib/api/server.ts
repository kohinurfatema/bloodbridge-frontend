import "server-only";

import { cookies } from "next/headers";

import {
  ApiError,
  buildQuery,
  parseResponse,
  type RequestOptions,
} from "@/lib/api/client";
import { backendFetch } from "@/lib/api/backend-fetch";
import { ACCESS_TOKEN_COOKIE, API_URL } from "@/lib/api/config";

/**
 * Server Component fetcher. Calls the backend directly with the access
 * token from the cookie (proxy.ts has already refreshed it if needed).
 */
export async function serverApi<T>(path: string, options: RequestOptions = {}) {
  const { body, query, headers, ...rest } = options;
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;

  let res: Response;
  try {
    res = await backendFetch(`${API_URL}${path}${buildQuery(query)}`, {
      cache: "no-store",
      ...rest,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Could not reach the BloodBridge API");
  }

  return parseResponse<T>(res);
}
