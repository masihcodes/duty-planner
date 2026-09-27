import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, errorMessage } from "./client";
import type {
  AdminPlanData,
  AssignmentInput,
  CalculatePlanResult,
  PlanInput,
  PlanRecord,
  TeamMember,
} from "../Utils/Types";

type PlanAction =
  | { kind: "publish" | "delete" }
  | { kind: "deadline"; selectionDeadline: string }
  | { kind: "assign"; assignment: AssignmentInput }
  | { kind: "remove"; assignmentId: number };

export function useAdminPlans() {
  return useQuery({
    queryKey: ["plans", "admin"],
    queryFn: async ({ signal }) =>
      (await api.get<PlanRecord[]>("/admin/plans", { signal })).data,
  });
}

export function useAdminPlan(planId?: number) {
  return useQuery({
    queryKey: ["plans", "admin", planId],
    enabled: !!planId,
    refetchInterval: 15_000,
    queryFn: async ({ signal }) =>
      (await api.get<AdminPlanData>(`/admin/plans/${planId}`, { signal })).data,
  });
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ["plan-users"],
    queryFn: async ({ signal }) =>
      (await api.get<TeamMember[]>("/admin/users", { signal })).data,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PlanInput) =>
      (await api.post<PlanRecord>("/admin/plans", input)).data,
    onSuccess: async () => {
      toast.success("Plan created");
      await queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
  });
}

export function useCalculatePlan(planId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      (await api.post<CalculatePlanResult>(`/admin/plans/${planId}/calculate`)).data,
    onSuccess: (result) => {
      const message = result.mode === "preview"
        ? "Preview calculated — not saved"
        : "Draft calculated";
      toast.success(message);
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
    onSettled: (result) => queryClient.invalidateQueries({
      // A preview changes no saved assignments; only refresh the manager's source data.
      queryKey: result?.mode === "preview" ? ["plans", "admin", planId] : ["plans"],
    }),
  });
}

export function useAdminPlanAction(planId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: PlanAction) => {
      const planUrl = `/admin/plans/${planId}`;

      switch (action.kind) {
        case "delete":
          return api.delete(planUrl);
        case "deadline":
          return api.patch(`${planUrl}/deadline`, {
            selectionDeadline: action.selectionDeadline,
          });
        case "assign":
          return api.post(`${planUrl}/assignments`, action.assignment);
        case "remove":
          return api.delete(`${planUrl}/assignments/${action.assignmentId}`);
        default:
          return api.post(`${planUrl}/${action.kind}`);
      }
    },
    onSuccess: async (_response, action) => {
      if (action.kind === "delete") {
        // Stop in-flight reads before removing the deleted plan from every cached view.
        await queryClient.cancelQueries({ queryKey: ["plans"] });
        for (const view of ["admin", "open", "published"]) {
          queryClient.setQueryData<PlanRecord[]>(
            ["plans", view],
            (currentPlans) => currentPlans?.filter((plan) => plan.id !== planId),
          );
          queryClient.removeQueries({
            queryKey: ["plans", view, planId],
            exact: true,
          });
        }
        toast.success("Plan deleted");
      } else {
        toast.success("Plan updated");
      }
    },
    onError: (error) => {
      toast.error(errorMessage(error));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["plans"] }),
  });
}
