import type { RequestHandler } from "express";
import { apiError } from "#utils/apiError.js";

export const notFound: RequestHandler = (_req, _res, next) => {
  next(apiError(404, "Route Not Found"));
};
