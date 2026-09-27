import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type { PlanRecord, PublishedPlan } from "../Utils/Types";

export function useAllPlans() {
  return useQuery({
    queryKey: ["plans", "published"],
    queryFn: async ({ signal }) =>
      (await api.get<PlanRecord[]>("/planer", { signal })).data,
  });
}

export function useMonthlyPlan(planId?: number) {
  return useQuery({
    queryKey: ["plans", "published", planId],
    queryFn: async ({ signal }) =>
      (await api.get<PublishedPlan>(`/planer/${planId}`, { signal })).data,
    enabled: !!planId,
  });
}
