import { Router } from "express";
import { login, logout, me, register } from "#controllers/authController.js";
import { authenticate } from "#middlewares/authenticate.js";
import { refresh } from "#middlewares/refresh.js";
import { validateBodyZod } from "#middlewares/validateBodyZod.js";
import { loginSchema, registerSchema } from "#validation/authSchemas.js";

export const authRouter = Router();

authRouter.post("/register", validateBodyZod(registerSchema), register);
authRouter.post("/login", validateBodyZod(loginSchema), login);
authRouter.delete("/logout", logout);
authRouter.post("/refresh", refresh);
authRouter.get("/me", authenticate, me);
