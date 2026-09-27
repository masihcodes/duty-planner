import z from "zod";
import { POSTGRES_INTEGER_MAX } from "#validation/planSchemas.js";
import { apiError } from "./apiError.js";

export function positiveId(value: unknown): number {
  const hasValidFormat = typeof value === "string" && /^[1-9]\d*$/.test(value);
  if (!hasValidFormat) throw apiError(400, "Invalid ID");

  const id = Number(value);
  const isValidInteger = Number.isSafeInteger(id) && id <= POSTGRES_INTEGER_MAX;
  if (!isValidInteger) throw apiError(400, "Invalid ID");

  return id;
}

export function assertPlanDate(month: string, date: string) {
  const isValidDate = z.iso.date().safeParse(date).success;
  const belongsToMonth = isValidDate && date.slice(0, 7) === month.slice(0, 7);

  if (!isValidDate || !belongsToMonth) {
    throw apiError(400, "The shift date must belong to this plan's month");
  }
}

export function assertFutureDeadline(value: string) {
  if (new Date(value).getTime() <= Date.now()) {
    throw apiError(400, "The deadline must be in the future");
  }
}
