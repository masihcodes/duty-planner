import type { RequestHandler } from "express";
import { readPlans } from "#db/planQueries.js";
import { getPublishedPlanDetails } from "#services/planService.js";
import { positiveId } from "#utils/planValidation.js";

export const getAllPlans: RequestHandler = async (_req, res) => {
  res.json(await readPlans("published"));
};

export const getMonthlyPlans: RequestHandler = async (req, res) => {
  res.json(await getPublishedPlanDetails(positiveId(req.params.id)));
};
