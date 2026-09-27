import { Router } from "express";
import { authenticate } from "#middlewares/authenticate.js";
import { requireActiveUser } from "#middlewares/authorize.js";
import { validateBodyZod } from "#middlewares/validateBodyZod.js";
import { requestSchema } from "#validation/planSchemas.js";
import { addRequest, getOpenPlan, getOpenPlans, removeRequest } from "#controllers/openPlanController.js";

export const openPlanRouter = Router();
openPlanRouter.use(authenticate, requireActiveUser);

openPlanRouter.get("/", getOpenPlans);
openPlanRouter.get("/:id", getOpenPlan);
openPlanRouter.post("/:id/requests", validateBodyZod(requestSchema), addRequest);
openPlanRouter.delete("/:id/requests/:requestId", removeRequest);
