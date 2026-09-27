import z from "zod";
import { shiftType } from "#db/schema.js";

export const POSTGRES_INTEGER_MAX = 2_147_483_647;
export const shiftSchema = z.enum(shiftType.enumValues);

export const requestSchema = z.object({
  date: z.iso.date(),
  shiftType: shiftSchema,
}).strict();

export const assignmentSchema = requestSchema.extend({
  userId: z.number().int().positive().max(POSTGRES_INTEGER_MAX),
});

export const createPlanSchema = z.object({
  month: z.iso.date().refine(
    (value) => value.endsWith("-01"),
    "Use the first day of the month",
  ),
  selectionDeadline: z.iso.datetime({ offset: true }),
}).strict();

export const deadlineSchema = createPlanSchema.pick({ selectionDeadline: true });

export type ShiftRequestInput = z.infer<typeof requestSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type DeadlineInput = z.infer<typeof deadlineSchema>;
