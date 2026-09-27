import type { RequestHandler } from "express";
import { readPlans } from "#db/planQueries.js";
import { readActiveUsers } from "#db/userQueries.js";
import { calculatePlan as calculatePlanResult } from "#services/planCalculationService.js";
import * as planService from "#services/planService.js";
import type { ValidatedRequestHandler } from "#types/index.js";
import { positiveId } from "#utils/planValidation.js";
import type { AssignmentInput, CreatePlanInput, DeadlineInput } from "#validation/planSchemas.js";

export const listAdminPlans: RequestHandler = async (_req, res) => {
  res.json(await readPlans());
};

export const listActiveUsers: RequestHandler = async (_req, res) => {
  res.json(await readActiveUsers());
};

export const getAdminPlan: RequestHandler = async (req, res) => {
  res.json(await planService.getAdminPlanDetails(positiveId(req.params.id)));
};

export const createPlan: ValidatedRequestHandler<CreatePlanInput> = async (req, res) => {
  const plan = await planService.createPlan(req.body);
  res.status(201).json(plan);
};

export const deletePlan: RequestHandler = async (req, res) => {
  const id = positiveId(req.params.id);
  await planService.deletePlan(id);
  res.json({ message: "Plan and its requests and assignments deleted", id });
};

export const updateDeadline: ValidatedRequestHandler<DeadlineInput> = async (req, res) => {
  await planService.updateDeadline(positiveId(req.params.id), req.body.selectionDeadline);
  res.json({ message: "Deadline updated" });
};

export const calculatePlan: RequestHandler = async (req, res) => {
  res.json(await calculatePlanResult(positiveId(req.params.id)));
};

export const addAssignment: ValidatedRequestHandler<AssignmentInput> = async (req, res) => {
  await planService.addAssignment(positiveId(req.params.id), req.body);
  res.status(201).json({ message: "Assignment saved" });
};

export const removeAssignment: RequestHandler = async (req, res) => {
  await planService.removeAssignment(
    positiveId(req.params.id),
    positiveId(req.params.assignmentId),
  );
  res.json({ message: "Assignment removed" });
};

export const publishPlan: RequestHandler = async (req, res) => {
  await planService.publishPlan(positiveId(req.params.id));
  res.json({ message: "Plan published" });
};
