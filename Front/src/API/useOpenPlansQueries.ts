import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, errorMessage } from "./client";
import type { OpenPlanData, PlanRecord, ShiftInput } from "../Utils/Types";

type RequestChange = { add: ShiftInput } | { remove: number };

export function useOpenPlans() {
  return useQuery({
    queryKey: ["plans", "open"],
    queryFn: async ({ signal }) =>
      (await api.get<PlanRecord[]>("/open-plans", { signal })).data,
    refetchInterval: 30_000,
  });
}

export function useOpenPlan(planId?: number) {
  return useQuery({
    queryKey: ["plans", "open", planId],
    queryFn: async ({ signal }) =>
      (await api.get<OpenPlanData>(`/open-plans/${planId}`, { signal })).data,
    enabled: !!planId,
    refetchInterval: 15_000,
    retry: false,
  });
}

export function useRequestChange(planId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (change: RequestChange) => {
      if ("add" in change) {
        await api.post(`/open-plans/${planId}/requests`, change.add);
      } else {
        await api.delete(`/open-plans/${planId}/requests/${change.remove}`);
      }
    },
    onSuccess: () => {
      toast.success("Preferences updated");
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["plans"] }),
  });
}
