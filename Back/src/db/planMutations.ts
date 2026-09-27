import { and, eq, sql, type SQLWrapper } from "drizzle-orm";
import { db } from "./db.js";
import { plans, shiftAssignments, shiftRequests } from "./schema.js";
import type { CalculatedAssignment, PlanRecord } from "#types/index.js";
import type { AssignmentInput, CreatePlanInput, ShiftRequestInput } from "#validation/planSchemas.js";

function lockPlan(planId: number) {
  return db.select({ id: plans.id })
    .from(plans)
    .where(eq(plans.id, planId))
    .for("update");
}

// Neon HTTP batches run in one transaction. Take the lock before checking state
// so requests, draft edits, publication, and deletion cannot race on the same plan.
async function executeLockedMutation(planId: number, statement: SQLWrapper) {
  const [, result] = await db.batch([
    lockPlan(planId),
    db.execute(statement),
  ]);

  return result.rows;
}

export async function insertPlan({ month, selectionDeadline }: CreatePlanInput) {
  const [plan] = await db.insert(plans)
    .values({ month, selectionDeadline: new Date(selectionDeadline) })
    .onConflictDoNothing({ target: plans.month })
    .returning();

  return plan;
}

export async function deletePlanWithEntries(planId: number) {
  // Delete children under the same lock. A failure rolls back all four steps.
  const [, , , deleted] = await db.batch([
    lockPlan(planId),
    db.delete(shiftRequests).where(eq(shiftRequests.planId, planId)),
    db.delete(shiftAssignments).where(eq(shiftAssignments.planId, planId)),
    db.delete(plans).where(eq(plans.id, planId)).returning({ id: plans.id }),
  ]);

  return deleted.length > 0;
}

export async function updateCollectingDeadline(planId: number, deadline: string) {
  const statement = db.update(plans)
    // Pass the original string so PostgreSQL keeps any sub-millisecond precision.
    .set({ selectionDeadline: sql`${deadline}::timestamptz` })
    .where(and(eq(plans.id, planId), eq(plans.status, "collecting")))
    .returning({ id: plans.id });

  const rows = await executeLockedMutation(planId, statement);
  return rows.length > 0;
}

interface DraftInput {
  plan: PlanRecord;
  userIds: number[];
  requestIds: number[];
  assignments: CalculatedAssignment[];
}

export async function saveCalculatedDraft({ plan, userIds, requestIds, assignments }: DraftInput) {
  const payload = JSON.stringify(assignments.map(entry => ({
    user_id: entry.userId,
    date: entry.date,
    shift_type: entry.shiftType,
  })));

  // Inputs may change while the draft is calculated. Recheck them after the lock.
  // JavaScript dates have millisecond precision, so compare deadlines at that precision.
  const rows = await executeLockedMutation(plan.id, sql`
    with ready as (
      update plans p set status = 'draft'
      where p.id = ${plan.id} and p.status = 'collecting'
        and p.month = ${plan.month}::date
        and p.selection_deadline <= clock_timestamp()
        and date_trunc('milliseconds', p.selection_deadline) = ${plan.selectionDeadline.toISOString()}::timestamptz
        and not exists (select 1 from shift_assignments a where a.plan_id = p.id)
        and (
          select coalesce(jsonb_agg(u.id order by u.id), '[]'::jsonb)
          from users u where u.is_active = true
        ) = ${JSON.stringify(userIds)}::jsonb
        and (
          select coalesce(jsonb_agg(r.id order by r.id), '[]'::jsonb)
          from shift_requests r where r.plan_id = p.id
        ) = ${JSON.stringify(requestIds)}::jsonb
      returning p.id
    ), inserted as (
      insert into shift_assignments (plan_id, user_id, date, shift_type)
      select ready.id, entry.user_id, entry.date::date, entry.shift_type::shift_type
      from ready
      cross join jsonb_to_recordset(${payload}::jsonb) as entry(user_id integer, date text, shift_type text)
      returning id
    )
    select count(*)::integer as count from inserted
  `);

  return Number(rows[0]?.count);
}

export async function insertDraftAssignment(planId: number, { userId, date, shiftType }: AssignmentInput) {
  // Updating the existing row keeps repeated saves successful without adding duplicates.
  const rows = await executeLockedMutation(planId, sql`
    insert into shift_assignments (plan_id, user_id, date, shift_type)
    select p.id, u.id, ${date}::date, ${shiftType}::shift_type
    from plans p cross join users u
    where p.id = ${planId} and p.status = 'draft' and u.id = ${userId} and u.is_active = true
    on conflict (plan_id, user_id, date, shift_type) do update set shift_type = excluded.shift_type
    returning id
  `);

  return rows.length > 0;
}

export async function deleteDraftAssignment(planId: number, assignmentId: number) {
  const rows = await executeLockedMutation(planId, sql`
    delete from shift_assignments a using plans p
    where a.id = ${assignmentId} and a.plan_id = ${planId}
      and p.id = a.plan_id and p.status = 'draft'
    returning a.id
  `);

  return rows.length > 0;
}

export async function publishDraftPlan(planId: number) {
  const rows = await executeLockedMutation(planId, sql`
    update plans p set status = 'published'
    where p.id = ${planId} and p.status = 'draft'
      and exists (select 1 from shift_assignments a where a.plan_id = p.id)
      and not exists (
        select 1 from shift_assignments a join users u on u.id = a.user_id
        where a.plan_id = p.id
          and (u.is_active = false or a.date < p.month or a.date >= p.month + interval '1 month')
      )
    returning p.id
  `);

  return rows.length > 0;
}

export async function insertOpenRequest(planId: number, userId: number, { date, shiftType }: ShiftRequestInput) {
  // Check the database clock after the lock; the client clock cannot decide the deadline.
  const rows = await executeLockedMutation(planId, sql`
    insert into shift_requests (plan_id, user_id, date, shift_type)
    select id, ${userId}, ${date}::date, ${shiftType}::shift_type
    from plans
    where id = ${planId} and status = 'collecting' and selection_deadline > clock_timestamp()
    on conflict (plan_id, user_id, date, shift_type) do update set shift_type = excluded.shift_type
    returning id
  `);

  return rows.length > 0;
}

export async function deleteOpenRequest(planId: number, requestId: number, userId: number) {
  const rows = await executeLockedMutation(planId, sql`
    delete from shift_requests r using plans p
    where r.id = ${requestId} and r.plan_id = ${planId} and r.user_id = ${userId}
      and p.id = r.plan_id and p.status = 'collecting' and p.selection_deadline > clock_timestamp()
    returning r.id
  `);

  return rows.length > 0;
}
