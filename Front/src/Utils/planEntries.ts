import { shifts } from "./Constants";
import { daysInMonth } from "./planDates";
import type { CalculatedShift } from "./Types";

export function entriesForDay<T extends CalculatedShift>(entries: T[], date: string): T[] {
  return entries.filter((entry) => entry.date === date);
}

export function countUnfilledShifts(month: string, assignments: CalculatedShift[]) {
  // Count occupied shifts, not people: several assignees can share one shift.
  const occupiedShifts = new Set(
    assignments.map((entry) => `${entry.date}/${entry.shiftType}`),
  );

  return daysInMonth(month) * shifts.length - occupiedShifts.size;
}
