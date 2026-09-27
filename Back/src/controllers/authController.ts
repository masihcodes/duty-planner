import type { RequestHandler } from "express";
import { authenticateUser, getCurrentUser, registerUser, toPublicUser } from "#services/authService.js";
import type { ValidatedRequestHandler } from "#types/index.js";
import { setSessionCookies } from "#utils/tokenHelper.js";
import type { LoginInput, RegisterInput } from "#validation/authSchemas.js";

export const register: ValidatedRequestHandler<RegisterInput> = async (req, res) => {
  const user = await registerUser(req.body);
  setSessionCookies(res, user);
  res.status(201).json({ message: "Registered successfully", user: toPublicUser(user) });
};

export const login: ValidatedRequestHandler<LoginInput> = async (req, res) => {
  const user = await authenticateUser(req.body);
  setSessionCookies(res, user);
  res.status(200).json({ message: "Logged in successfully", user: toPublicUser(user) });
};

export const me: RequestHandler = async (req, res) => {
  const user = await getCurrentUser(Number(req.user?.id));
  res.status(200).json(user);
};

export const logout: RequestHandler = (_req, res) => {
  res.clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ message: "Logged out successfully" });
};
