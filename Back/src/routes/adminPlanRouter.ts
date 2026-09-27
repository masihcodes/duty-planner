import { Router } from "express";
import {
  addAssignment,
  calculatePlan,
  createPlan,
  deletePlan,
  getAdminPlan,
  listActiveUsers,
  listAdminPlans,
  publishPlan,
  removeAssignment,
  updateDeadline,
} from "#controllers/adminPlanController.js";
import { authenticate } from "#middlewares/authenticate.js";
import { requireActiveUser, requireAdmin } from "#middlewares/authorize.js";
import { validateBodyZod } from "#middlewares/validateBodyZod.js";
import { assignmentSchema, createPlanSchema, deadlineSchema } from "#validation/planSchemas.js";

export const adminPlanRouter = Router();
adminPlanRouter.use(authenticate, requireActiveUser, requireAdmin);

adminPlanRouter.get("/users", listActiveUsers);
adminPlanRouter.get("/plans", listAdminPlans);
adminPlanRouter.post("/plans", validateBodyZod(createPlanSchema), createPlan);
adminPlanRouter.get("/plans/:id", getAdminPlan);
adminPlanRouter.delete("/plans/:id", deletePlan);
adminPlanRouter.patch("/plans/:id/deadline", validateBodyZod(deadlineSchema), updateDeadline);
adminPlanRouter.post("/plans/:id/calculate", calculatePlan);
adminPlanRouter.post("/plans/:id/assignments", validateBodyZod(assignmentSchema), addAssignment);
adminPlanRouter.delete("/plans/:id/assignments/:assignmentId", removeAssignment);
adminPlanRouter.post("/plans/:id/publish", publishPlan);
