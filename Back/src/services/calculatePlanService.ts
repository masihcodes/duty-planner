import type { CalculatedAssignment, ShiftType } from "#types/index.js";

export type { CalculatedAssignment, ShiftType } from "#types/index.js";

export const SHIFT_WEIGHTS = { morning: 3, afternoon: 4, night: 6 } as const;
export const HISTORY_MONTHS = 2;
export const REQUEST_BONUS = 1;
const SHIFT_ORDER: ShiftType[] = ["night", "afternoon", "morning"];

interface CalculationInput {
  month: string;
  userIds: number[];
  requests: CalculatedAssignment[];
  history: CalculatedAssignment[];
  rotationStart?: number;
}

export function historyStartMonth(month: string): string {
  const date = new Date(`${month}T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() - HISTORY_MONTHS);
  return date.toISOString().slice(0, 10);
}

function shiftKey({ userId, date, shiftType }: CalculatedAssignment): string {
  return `${userId}/${date}/${shiftType}`;
}

function initialWorkloads(userIds: number[], history: CalculatedAssignment[]) {
  const workloads = new Map(userIds.map(userId => [userId, 0]));
  for (const assignment of history) {
    if (!workloads.has(assignment.userId)) continue;
    const previousLoad = workloads.get(assignment.userId)!;
    workloads.set(assignment.userId, previousLoad + SHIFT_WEIGHTS[assignment.shiftType]);
  }
  return workloads;
}

// Everyone in userIds can take any shift. Requests are preferences, not reservations.
export function calculateWeightedPlan({
  month,
  userIds,
  requests,
  history,
  rotationStart = 0,
}: CalculationInput): CalculatedAssignment[] {
  const sortedUserIds = [...new Set(userIds)].sort((a, b) => a - b);
  if (!sortedUserIds.length) throw new Error("At least one user is required to calculate a plan");

  const workloads = initialWorkloads(sortedUserIds, history);
  const preferences = new Set(requests.map(shiftKey));
  const assignments: CalculatedAssignment[] = [];

  // Calendar dates use UTC so local timezone changes do not move a shift to another day.
  const monthEnd = new Date(`${month}T00:00:00.000Z`);
  monthEnd.setUTCMonth(monthEnd.getUTCMonth() + 1, 0);
  const daysInMonth = monthEnd.getUTCDate();
  let nextUserIndex = rotationStart % sortedUserIds.length;

  // Allocate heavier shifts first, then use lighter shifts to balance the workload.
  for (const shiftType of SHIFT_ORDER) {
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${month.slice(0, 7)}-${String(day).padStart(2, "0")}`;
      let chosenUserIndex = nextUserIndex;
      let lowestScore = Infinity;

      for (let offset = 0; offset < sortedUserIds.length; offset++) {
        const candidateIndex = (nextUserIndex + offset) % sortedUserIds.length;
        const userId = sortedUserIds[candidateIndex]!;
        const requested = preferences.has(shiftKey({ userId, date, shiftType }));
        const score = workloads.get(userId)! - (requested ? REQUEST_BONUS : 0);

        // Keep the first candidate on an exact tie; the starting point rotates.
        if (score < lowestScore) {
          lowestScore = score;
          chosenUserIndex = candidateIndex;
        }
      }

      const userId = sortedUserIds[chosenUserIndex]!;
      assignments.push({ userId, date, shiftType });
      // The preference bonus never reduces the person's actual workload.
      workloads.set(userId, workloads.get(userId)! + SHIFT_WEIGHTS[shiftType]);
      nextUserIndex = (chosenUserIndex + 1) % sortedUserIds.length;
    }
  }

  return assignments;
}
