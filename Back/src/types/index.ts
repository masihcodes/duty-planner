import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { plans, shiftAssignments, users } from "#db/schema.js";

export type User = typeof users.$inferSelect;
export type PublicUser = Omit<User, "password">;
export type PlanRecord = typeof plans.$inferSelect;
export type PlanStatus = PlanRecord["status"];
export type ShiftType = (typeof shiftAssignments.$inferSelect)["shiftType"];

export interface CalculatedAssignment {
  userId: number;
  date: string;
  shiftType: ShiftType;
}

// Use this type on routes that run validateBodyZod before the controller.
export type ValidatedRequestHandler<Body> = RequestHandler<ParamsDictionary, unknown, Body>;

export interface ErrorDetail {
  path: string | null;
  message: string;
}

export interface ApiErrorResponse {
  status: number;
  details: ErrorDetail[];
}
