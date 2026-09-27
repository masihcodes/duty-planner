import type { SubmitEvent } from "react";
import { Trash2 } from "lucide-react";
import { localDateTime, monthLabel } from "../../Utils/planDates";
import type { PlanRecord } from "../../Utils/Types";

interface PlanOverviewProps {
  plan: PlanRecord;
  requestCount: number;
  assignmentCount: number;
  unfilledCount: number;
  hasTeamMembers: boolean;
  isBusy: boolean;
  isCalculating: boolean;
  isDeadlinePassed: boolean;
  onDelete: () => void;
  onPublish: () => void;
  onCalculate: () => void;
  onUpdateDeadline: (deadline: string) => void;
}

export default function PlanOverview({
  plan,
  requestCount,
  assignmentCount,
  unfilledCount,
  hasTeamMembers,
  isBusy,
  isCalculating,
  isDeadlinePassed,
  onDelete,
  onPublish,
  onCalculate,
  onUpdateDeadline,
}: PlanOverviewProps) {
  const statusClass = plan.status === "published" ? "badge-success" : "badge-warning badge-soft";
  const calculationMessage = getCalculationMessage(hasTeamMembers, isDeadlinePassed);

  function handleDeadlineSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const deadline = String(new FormData(event.currentTarget).get("deadline"));
    onUpdateDeadline(new Date(deadline).toISOString());
  }

  return (
    <section className="card card-border bg-base-200">
      <div className="card-body gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="card-title text-2xl">{monthLabel(plan.month)}</h2>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`badge capitalize ${statusClass}`}>{plan.status}</span>
            <button
              type="button"
              className="btn btn-sm btn-error btn-outline"
              disabled={isBusy}
              onClick={onDelete}
            >
              <Trash2 size={16} aria-hidden="true" />Delete plan
            </button>
          </div>
        </div>
        <p className="text-sm text-base-content/70">
          Selection deadline: {new Date(plan.selectionDeadline).toLocaleString("en-GB")}
        </p>
        <div className="stats stats-vertical bg-base-100 sm:stats-horizontal">
          <div className="stat">
            <div className="stat-title">Requests</div>
            <div className="stat-value text-primary">{requestCount}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Assignments</div>
            <div className="stat-value">{assignmentCount}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Shifts with no assignee</div>
            <div className="stat-value text-warning">{unfilledCount}</div>
          </div>
        </div>
        {plan.status === "collecting" && (
          // Reset the uncontrolled input only when the server's saved deadline changes.
          <form
            key={plan.selectionDeadline}
            className="flex flex-wrap items-end gap-3"
            onSubmit={handleDeadlineSubmit}
          >
            <label className="fieldset min-w-0 w-full sm:w-auto">
              <span className="fieldset-legend">Update deadline (your local time)</span>
              <input
                name="deadline"
                type="datetime-local"
                className="input w-full"
                required
                defaultValue={localDateTime(plan.selectionDeadline)}
              />
            </label>
            <button className="btn btn-outline mb-1" disabled={isBusy}>Update deadline</button>
          </form>
        )}
        {plan.status === "collecting" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn btn-primary"
                disabled={isBusy || !hasTeamMembers}
                onClick={onCalculate}
              >
                {isCalculating && (
                  <span className="loading loading-spinner loading-sm" aria-hidden="true" />
                )}
                {isCalculating ? "Calculating…" : "Calculate plan"}
              </button>
              <p className="text-sm text-base-content/70">{calculationMessage}</p>
            </div>
            <p className="text-xs text-base-content/60">
              Uses current preferences and workload from the previous two months. A draft is created only when you calculate after the deadline.
            </p>
          </div>
        )}
        {plan.status === "draft" && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-2xl text-sm text-base-content/70">
              Review the calculated draft, edit assignments if needed, then publish it for your team.
            </p>
            <button
              className="btn btn-success"
              disabled={!assignmentCount || isBusy}
              onClick={onPublish}
            >
              Publish plan
            </button>
          </div>
        )}
        {plan.status === "published" && (
          <div className="alert alert-success alert-soft">
            This plan is visible to your team. Published assignments are read-only.
          </div>
        )}
      </div>
    </section>
  );
}

function getCalculationMessage(hasTeamMembers: boolean, isDeadlinePassed: boolean) {
  if (!hasTeamMembers) return "Add an active team member to calculate a plan.";
  if (isDeadlinePassed) {
    return "Requests are closed. Calculate to save a draft for review and editing.";
  }
  return "Preview the schedule without saving it. Your team can continue changing requests until the deadline.";
}
