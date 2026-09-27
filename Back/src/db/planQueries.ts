import { and, asc, desc, eq, gte, lt } from "drizzle-orm";
import { db } from "./db.js";
import { plans, shiftAssignments, shiftRequests, users } from "./schema.js";
import type { PlanStatus } from "#types/index.js";

export function readPlans(status?: PlanStatus) {
  return db.select()
    .from(plans)
    .where(status === undefined ? undefined : eq(plans.status, status))
    .orderBy(desc(plans.month));
}

export async function readPlanById(planId: number) {
  const [plan] = await db.select().from(plans).where(eq(plans.id, planId));
  return plan;
}

export function readEntries(planId: number, kind: "requests" | "assignments") {
  const table = kind === "requests" ? shiftRequests : shiftAssignments;

  return db.select({
    id: table.id,
    userId: table.userId,
    name: users.name,
    date: table.date,
    shiftType: table.shiftType,
  })
    .from(table)
    .innerJoin(users, eq(table.userId, users.id))
    .where(eq(table.planId, planId))
    .orderBy(asc(table.date), asc(table.shiftType), asc(users.name));
}

export function readCalculationRequests(planId: number) {
  // Stable ID order lets the save query check whether the request list changed.
  return db.select({
    id: shiftRequests.id,
    userId: shiftRequests.userId,
    date: shiftRequests.date,
    shiftType: shiftRequests.shiftType,
  })
    .from(shiftRequests)
    .where(eq(shiftRequests.planId, planId))
    .orderBy(asc(shiftRequests.id));
}

export function readPublishedHistory(startMonth: string, endMonth: string) {
  return db.select({
    userId: shiftAssignments.userId,
    date: shiftAssignments.date,
    shiftType: shiftAssignments.shiftType,
  })
    .from(shiftAssignments)
    .innerJoin(plans, eq(shiftAssignments.planId, plans.id))
    .where(and(
      eq(plans.status, "published"),
      gte(plans.month, startMonth),
      lt(plans.month, endMonth),
    ));
}

export async function hasAssignments(planId: number) {
  const entries = await db.select({ id: shiftAssignments.id })
    .from(shiftAssignments)
    .where(eq(shiftAssignments.planId, planId))
    .limit(1);

  return entries.length > 0;
}
