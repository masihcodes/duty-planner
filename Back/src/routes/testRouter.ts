import { Router } from "express";


import { db } from "#db/db.js";
import { plans, shiftAssignments, users } from "#db/schema.js";
import { eq, and, asc } from "drizzle-orm";


export const testRouter = Router();


testRouter.route("/1")
  .get(async (req, res) => {
    const myPlans = await db
      .select()
      .from(shiftAssignments)
      .where(and(
        eq(shiftAssignments.userId, 2),
        eq(shiftAssignments.planId, 2)
      ))
      .orderBy(asc(shiftAssignments.date));

    res.status(200).json(myPlans)
  })

testRouter.route("/2")
  .get(async (req, res) => {
    const myPlans = await db
      .select({ name: users.name, planId: shiftAssignments.planId, type: shiftAssignments.shiftType, date: shiftAssignments.date, status: plans.status })
      .from(shiftAssignments)
      .innerJoin(users, eq(shiftAssignments.userId, users.id))
      .innerJoin(plans, eq(shiftAssignments.planId, plans.id))
      .where(and(
        eq(users.name, "Emma Wilson"),
        eq(shiftAssignments.planId, 1)
      ))
      .orderBy(asc(shiftAssignments.date));

    res.status(200).json(myPlans)
  })

testRouter.route("/3")
  .get(async (req, res) => {
    const myPlans = await db
      .select({ name: users.name, type: shiftAssignments.shiftType, date: shiftAssignments.date })
      .from(shiftAssignments)
      .innerJoin(users, eq(shiftAssignments.userId, users.id))
      .innerJoin(plans, eq(shiftAssignments.planId, plans.id))
      .where(eq(shiftAssignments.planId, 1))
      .orderBy(asc(shiftAssignments.date));

    res.status(200).json(myPlans)
  })