import type { RequestHandler } from "express";
import { readPlans } from "#db/planQueries.js";
import * as planService from "#services/planService.js";
import type { ValidatedRequestHandler } from "#types/index.js";
import { positiveId } from "#utils/planValidation.js";
import type { ShiftRequestInput } from "#validation/planSchemas.js";

export const getOpenPlans: RequestHandler = async (_req, res) => {
  res.json(await readPlans("collecting"));
};

export const getOpenPlan: RequestHandler = async (req, res) => {
  res.json(await planService.getOpenPlanDetails(positiveId(req.params.id)));
};

export const addRequest: ValidatedRequestHandler<ShiftRequestInput> = async (req, res) => {
  await planService.addRequest(positiveId(req.params.id), Number(req.user!.id), req.body);
  res.status(201).json({ message: "Request saved" });
};

export const removeRequest: RequestHandler = async (req, res) => {
  await planService.removeRequest(
    positiveId(req.params.id),
    positiveId(req.params.requestId),
    Number(req.user!.id),
  );
  res.json({ message: "Request removed" });
};
