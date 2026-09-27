import { Router } from "express";
import { authenticate } from "#middlewares/authenticate.js";
import { requireActiveUser } from "#middlewares/authorize.js";
import { getAllPlans, getMonthlyPlans } from "#controllers/planController.js";

export const planerRouter = Router();
planerRouter.use(authenticate, requireActiveUser);

planerRouter.get("/", getAllPlans);
planerRouter.get("/:id", getMonthlyPlans);
