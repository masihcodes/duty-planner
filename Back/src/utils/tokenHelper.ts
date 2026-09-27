import type { CookieOptions, Response } from "express";
import jwt from "jsonwebtoken";
import type { User } from "#types/index.js";

const ACCESS_SECRET = process.env.ACCESS_JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_JWT_SECRET!;
const ACCESS_TOKEN_TTL_SECONDS = Number(process.env.ACCESS_TOKEN_TTL);
const REFRESH_TOKEN_TTL_SECONDS = Number(process.env.REFRESH_TOKEN_TTL);

type TokenUser = Pick<User, "id" | "role">;

export function makeAccessToken(user: TokenUser): string {
  const payload = { userID: String(user.id), role: user.role };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });
}

export function makeRefreshToken(user: Pick<User, "id">): string {
  const payload = { userID: String(user.id) };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_TTL_SECONDS });
}

function cookieOptions(ttlSeconds: number): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    // JWT uses seconds; cookies use milliseconds.
    maxAge: ttlSeconds * 1000,
  };
}

export function setAccessCookie(res: Response, token: string) {
  res.cookie("accessToken", token, cookieOptions(ACCESS_TOKEN_TTL_SECONDS));
}

export function setRefreshCookie(res: Response, token: string) {
  res.cookie("refreshToken", token, cookieOptions(REFRESH_TOKEN_TTL_SECONDS));
}

export function setSessionCookies(res: Response, user: TokenUser) {
  // Create both tokens before changing the response cookies.
  const accessToken = makeAccessToken(user);
  const refreshToken = makeRefreshToken(user);

  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);
}
