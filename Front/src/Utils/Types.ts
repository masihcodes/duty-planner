export interface User {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
  createdAt: string;
}

export interface Register {
  name: string;
  email: string;
  password: string;
}

export interface Login {
  email: string;
  password: string;
}

export interface PlannerState {
  user: User;
  allPlansMonth: string[];
}

export type ShiftType = "morning" | "afternoon" | "night";
export type PlanStatus = "collecting" | "draft" | "published";

export interface PlanRecord {
  id: number;
  month: string;
  selectionDeadline: string;
  status: PlanStatus;
  createdAt: string;
}

export interface ShiftEntry {
  id: number;
  userId: number;
  name: string;
  date: string;
  shiftType: ShiftType;
}

// Calculated previews have the same display fields as saved shifts, without a database ID.
export type CalculatedShift = Omit<ShiftEntry, "id">;

export type CalculatePlanResult =
  | { mode: "preview"; calculatedAt: string; assignments: CalculatedShift[] }
  | { mode: "draft"; assignmentCount: number };

export interface ShiftInput {
  date: string;
  shiftType: ShiftType;
}

export interface AssignmentInput extends ShiftInput {
  userId: number;
}

export interface PublishedPlan {
  plan: PlanRecord;
  assignments: ShiftEntry[];
}

export interface OpenPlanData {
  plan: PlanRecord;
  requests: ShiftEntry[];
  serverTime: string;
}

export interface AdminPlanData extends OpenPlanData {
  assignments: ShiftEntry[];
}

export interface PlanInput {
  month: string;
  selectionDeadline: string;
}

export interface TeamMember {
  id: number;
  name: string;
}
