/**
 * fetch() for server-side calls to the backend. Node reuses idle keep-alive
 * sockets, and Render closes them without notice, so the first call after a
 * pause can fail before reaching the API. Retry such network errors once.
 *
 * Only safe requests retry by default; pass `retry: true` for POSTs that are
 * harmless to repeat (login, token refresh).
 */
export async function backendFetch(
  url: string,
  init: RequestInit & { retry?: boolean } = {},
) {
  const { retry, ...rest } = init;
  const method = (rest.method ?? "GET").toUpperCase();
  const canRetry = retry ?? (method === "GET" || method === "HEAD");

  try {
    return await fetch(url, rest);
  } catch (error) {
    if (!canRetry) throw error;
    return fetch(url, rest);
  }
}
