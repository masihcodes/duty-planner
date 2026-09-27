import * as mutations from "#db/planMutations.js";
import { readEntries, readPlanById } from "#db/planQueries.js";
import { apiError } from "#utils/apiError.js";
import { assertFutureDeadline, assertPlanDate } from "#utils/planValidation.js";
import type { AssignmentInput, CreatePlanInput, ShiftRequestInput } from "#validation/planSchemas.js";

export async function findPlan(planId: number) {
  const plan = await readPlanById(planId);
  if (!plan) throw apiError(404, "Plan not found");
  return plan;
}

export async function getAdminPlanDetails(planId: number) {
  const plan = await findPlan(planId);
  const [requests, assignments] = await Promise.all([
    readEntries(planId, "requests"),
    readEntries(planId, "assignments"),
  ]);

  return { plan, requests, assignments, serverTime: new Date().toISOString() };
}

export async function getOpenPlanDetails(planId: number) {
  const plan = await findPlan(planId);
  if (plan.status !== "collecting") {
    throw apiError(409, "This plan is no longer collecting requests");
  }

  const requests = await readEntries(planId, "requests");
  return { plan, requests, serverTime: new Date().toISOString() };
}

export async function getPublishedPlanDetails(planId: number) {
  const plan = await findPlan(planId);
  if (plan.status !== "published") throw apiError(404, "Published plan not found");

  const assignments = await readEntries(planId, "assignments");
  return { plan, assignments };
}

export async function createPlan(input: CreatePlanInput) {
  assertFutureDeadline(input.selectionDeadline);
  const plan = await mutations.insertPlan(input);
  if (!plan) throw apiError(409, "A plan already exists for this month");
  return plan;
}

export async function deletePlan(planId: number) {
  const deleted = await mutations.deletePlanWithEntries(planId);
  if (!deleted) throw apiError(404, "Plan not found");
}

export async function updateDeadline(planId: number, deadline: string) {
  assertFutureDeadline(deadline);
  const updated = await mutations.updateCollectingDeadline(planId, deadline);
  if (!updated) throw apiError(409, "Only collecting plans can change their deadline");
}

export async function addAssignment(planId: number, input: AssignmentInput) {
  const plan = await findPlan(planId);
  assertPlanDate(plan.month, input.date);

  const saved = await mutations.insertDraftAssignment(planId, input);
  if (!saved) throw apiError(409, "Assignments require a draft plan and an active user");
}

export async function removeAssignment(planId: number, assignmentId: number) {
  const removed = await mutations.deleteDraftAssignment(planId, assignmentId);
  if (!removed) throw apiError(409, "Assignment not found or this plan is not a draft");
}

export async function publishPlan(planId: number) {
  const published = await mutations.publishDraftPlan(planId);
  if (!published) {
    throw apiError(409, "Publish requires a draft with assignments for active users within this month");
  }
}

export async function addRequest(planId: number, userId: number, input: ShiftRequestInput) {
  const plan = await findPlan(planId);
  assertPlanDate(plan.month, input.date);

  const saved = await mutations.insertOpenRequest(planId, userId, input);
  if (!saved) throw apiError(409, "Requests are closed for this plan");
}

export async function removeRequest(planId: number, requestId: number, userId: number) {
  const removed = await mutations.deleteOpenRequest(planId, requestId, userId);
  if (!removed) {
    throw apiError(409, "The request is unavailable or the selection window has closed");
  }
}
