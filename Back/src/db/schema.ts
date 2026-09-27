import { sql } from "drizzle-orm";
import { boolean, check, date, integer, pgEnum, pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

export const userRole = pgEnum("role", ["admin", "user"]);
export const planStatus = pgEnum("plan_status", ["collecting", "draft", "published"]);
export const shiftType = pgEnum("shift_type", ["morning", "afternoon", "night"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  role: userRole("role").default("user").notNull(),
  password: text("password").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  month: date("month").unique().notNull(),
  selectionDeadline: timestamp("selection_deadline", { withTimezone: true }).notNull(),
  status: planStatus("status").default("collecting").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check("plans_month_first_day", sql`extract(day from ${table.month}) = 1`),
]);

export const shiftRequests = pgTable("shift_requests", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").references(() => plans.id, { onDelete: "restrict" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "restrict" }).notNull(),
  date: date("date").notNull(),
  shiftType: shiftType("shift_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique("shift_requests_user_shift_unique").on(table.planId, table.userId, table.date, table.shiftType),
]);

export const shiftAssignments = pgTable("shift_assignments", {
  id: serial("id").primaryKey(),
  planId: integer("plan_id").references(() => plans.id, { onDelete: "restrict" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "restrict" }).notNull(),
  date: date("date").notNull(),
  shiftType: shiftType("shift_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique("shift_assignments_user_shift_unique").on(table.planId, table.userId, table.date, table.shiftType),
]);
