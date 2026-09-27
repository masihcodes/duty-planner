import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true,
});

let refreshRequest: Promise<unknown> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const isAuthAction = /\/auth\/(login|register|refresh|logout)$/.test(request?.url ?? "");
    const cannotRetry =
      error.response?.status !== 401 ||
      !request ||
      request._retry ||
      request.signal?.aborted ||
      isAuthAction;

    if (cannotRetry) throw error;

    request._retry = true;
    // Concurrent 401 responses share one refresh; each original request retries once.
    refreshRequest ??= axios.post(
      `${api.defaults.baseURL}/auth/refresh`,
      {},
      { withCredentials: true },
    ).finally(() => {
      refreshRequest = null;
    });

    await refreshRequest;
    return api(request);
  },
);

export async function waitForRefresh() {
  // A failed refresh must not prevent a subsequent login or logout.
  await refreshRequest?.catch(() => undefined);
}

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const details: unknown = error.response?.data?.details;

    if (Array.isArray(details)) {
      const messages = details.flatMap((detail) =>
        typeof detail?.message === "string" ? [detail.message] : [],
      );
      if (messages.length) return messages.join(" · ");
    }

    if (!error.response) return "Unable to reach the server. Please try again.";
  }

  return "Something went wrong. Please try again.";
}
