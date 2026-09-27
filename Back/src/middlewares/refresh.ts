import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { readUserById } from "#db/userQueries.js";
import { apiError } from "#utils/apiError.js";
import { setSessionCookies } from "#utils/tokenHelper.js";

export const refresh: RequestHandler = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return next(apiError(401, "Not Authenticated"));

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET!) as jwt.JwtPayload;
    const user = await readUserById(Number(decoded.userID));
    if (!user) return next(apiError(404, "User Not Found"));

    setSessionCookies(res, user);
    res.status(200).json({ message: "Token Refreshed" });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(apiError(401, "Expired Refresh Token"));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(apiError(401, "Invalid Token"));
    }
    return next(error);
  }
};
