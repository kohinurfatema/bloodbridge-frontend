import type { ApiFailure, ApiSuccess } from "@/types";

/**
 * Error thrown for any non-2xx response. Carries the backend's
 * message and field errors so forms and toasts can show them.
 */
export class ApiError extends Error {
  status: number;
  errors: string[];

  constructor(status: number, message: string, errors: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  query?: Record<string, QueryValue>;
}

export function buildQuery(query?: Record<string, QueryValue>) {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function parseResponse<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiFailure
    | null;

  if (!res.ok || !json || json.success === false) {
    const message =
      json?.message ??
      (res.status >= 500
        ? "Server error, please try again later."
        : "Request failed");
    const errors = json && "errors" in json ? json.errors : [];
    throw new ApiError(res.status, message, errors);
  }

  return json.data;
}

/**
 * Browser-side fetcher. All calls go through the Next.js proxy route
 * (/api/proxy/*) which attaches the JWT from the httpOnly cookie, so the
 * token is never exposed to client-side JavaScript.
 */
export async function api<T>(path: string, options: RequestOptions = {}) {
  const { body, query, headers, ...rest } = options;

  let res: Response;
  try {
    res = await fetch(`/api/proxy${path}${buildQuery(query)}`, {
      ...rest,
      headers: {
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Network error. Check your internet connection.");
  }

  return parseResponse<T>(res);
}
