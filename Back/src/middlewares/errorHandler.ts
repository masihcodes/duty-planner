import type { ErrorRequestHandler } from "express";
import type { ApiErrorResponse, ErrorDetail } from "#types/index.js";

function isErrorDetail(value: unknown): value is ErrorDetail {
  return (
    typeof value === "object" &&
    value !== null &&
    "path" in value &&
    (value.path === null || typeof value.path === "string") &&
    "message" in value &&
    typeof value.message === "string"
  );
}

function errorStatus(value: unknown): number {
  if (typeof value === "number" && Number.isInteger(value) && value >= 400 && value <= 599) {
    return value;
  }
  return 500;
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) return next(err);

  const status = errorStatus(err?.status);
  let details: ErrorDetail[];

  if (status >= 500) {
    // Keep the full error in server logs, but hide internal details from the client.
    console.error(err);
    details = [{ path: null, message: "Internal server error" }];
  } else if (
    Array.isArray(err?.details) &&
    err.details.length > 0 &&
    err.details.every(isErrorDetail)
  ) {
    details = err.details.map(({ path, message }: ErrorDetail) => ({ path, message }));
  } else if (typeof err?.details === "string") {
    details = [{ path: null, message: err.details }];
  } else {
    details = [{
      path: null,
      message: typeof err?.message === "string" ? err.message : "Request failed",
    }];
  }

  const response: ApiErrorResponse = { status, details };
  res.status(status).json(response);
};
