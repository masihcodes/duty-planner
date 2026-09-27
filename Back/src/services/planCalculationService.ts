import { saveCalculatedDraft } from "#db/planMutations.js";
import { hasAssignments, readCalculationRequests, readPublishedHistory } from "#db/planQueries.js";
import { readActiveUsers } from "#db/userQueries.js";
import { apiError } from "#utils/apiError.js";
import { calculateWeightedPlan, historyStartMonth } from "./calculatePlanService.js";
import { findPlan } from "./planService.js";

export async function calculatePlan(planId: number) {
  const plan = await findPlan(planId);
  if (plan.status !== "collecting") {
    throw apiError(409, "Only collecting plans can be calculated. Existing drafts and published plans are preserved");
  }

  const [team, requests, history, alreadyHasAssignments] = await Promise.all([
    readActiveUsers("id"),
    readCalculationRequests(planId),
    readPublishedHistory(historyStartMonth(plan.month), plan.month),
    hasAssignments(planId),
  ]);

  if (alreadyHasAssignments) {
    throw apiError(409, "This plan already has assignments. Calculation will not replace them");
  }
  if (!team.length) throw apiError(409, "Add an active team member before calculating a plan");

  const userIds = team.map(user => user.id);
  const assignments = calculateWeightedPlan({
    month: plan.month,
    userIds,
    requests,
    history,
    rotationStart: planId,
  });
  const calculatedAt = new Date();

  // Before the deadline, return a preview without saving any changes.
  if (calculatedAt < plan.selectionDeadline) {
    const names = new Map(team.map(user => [user.id, user.name]));
    return {
      mode: "preview" as const,
      calculatedAt: calculatedAt.toISOString(),
      assignments: assignments.map(entry => ({ ...entry, name: names.get(entry.userId)! })),
    };
  }

  const savedCount = await saveCalculatedDraft({
    plan,
    userIds,
    requestIds: requests.map(request => request.id),
    assignments,
  });
  if (savedCount !== assignments.length) {
    throw apiError(409, "The plan or team changed. Refresh before calculating again");
  }

  return { mode: "draft" as const, message: "Draft calculated", assignmentCount: assignments.length };
}
