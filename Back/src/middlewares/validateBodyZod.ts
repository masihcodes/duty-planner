import type { RequestHandler } from "express";
import type { ZodObject } from "zod";
import type { ApiErrorResponse } from "#types/index.js";

export function validateBodyZod(schema: ZodObject): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error: ApiErrorResponse = {
        status: 400,
        details: result.error.issues.map(issue => ({
          path: issue.path.length > 0 ? issue.path.join(".") : null,
          message: issue.message,
        })),
      };
      return next(error);
    }

    req.body = result.data;
    next();
  };
}
