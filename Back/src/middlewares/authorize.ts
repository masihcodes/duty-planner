import type { RequestHandler } from "express";
import { readUserAccess } from "#db/userQueries.js";
import { apiError } from "#utils/apiError.js";

export const requireActiveUser: RequestHandler = async (req, _res, next) => {
  const userId = Number(req.user?.id);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return next(apiError(401, "Not authenticated"));
  }

  // Read the current account state; the token may contain an old role.
  const user = await readUserAccess(userId);
  if (!user || !user.isActive) return next(apiError(403, "This account is not active"));

  req.user = { id: String(user.id), role: user.role };
  next();
};

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    return next(apiError(403, "Administrator access required"));
  }
  next();
};
