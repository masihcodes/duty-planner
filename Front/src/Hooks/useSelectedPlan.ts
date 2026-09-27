import { useState } from "react";
import type { PlanRecord } from "../Utils/Types";

export function useSelectedPlan(plans: PlanRecord[] | undefined) {
  const [selectedPlanId, selectPlan] = useState<number | null>(null);

  // Keep the existing fallback when the list first loads or a selected plan is deleted.
  const selectedPlan = plans?.find((plan) => plan.id === selectedPlanId) ?? plans?.[0];

  return { selectedPlan, selectPlan };
}
