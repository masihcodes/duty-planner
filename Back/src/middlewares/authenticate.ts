import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { apiError } from "#utils/apiError.js";

const ACCESS_SECRET = process.env.ACCESS_JWT_SECRET!;

export const authenticate: RequestHandler = (req, _res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return next(apiError(401, "Not authenticated"));

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET) as jwt.JwtPayload;
    req.user = { id: decoded.userID, role: decoded.role ?? "user" };
    return next();
  } catch (error) {
    const message = error instanceof jwt.TokenExpiredError ? "Expired access token" : "Invalid token";
    return next(apiError(401, message));
  }
};
