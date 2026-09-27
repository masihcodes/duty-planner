import type { ApiErrorResponse } from "#types/index.js";

export function apiError(status: number, message: string): ApiErrorResponse {
  return { status, details: [{ path: null, message }] };
}
