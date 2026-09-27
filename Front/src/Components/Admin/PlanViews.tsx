import type { CalculatePlanResult } from "../../Utils/Types";

export type PlanView = "assignments" | "requests" | "preview";
type PlanPreview = Extract<CalculatePlanResult, { mode: "preview" }>;

interface PlanViewTabsProps {
  activeView: PlanView;
  preview: PlanPreview | null;
  onSelectView: (view: PlanView) => void;
}

export function PlanViewTabs({ activeView, preview, onSelectView }: PlanViewTabsProps) {
  return (
    <div role="tablist" className="tabs tabs-box w-fit">
      <button
        role="tab"
        aria-selected={activeView === "requests"}
        className={`tab ${activeView === "requests" ? "tab-active" : ""}`}
        onClick={() => onSelectView("requests")}
      >
        Requests
      </button>
      <button
        role="tab"
        aria-selected={activeView === "assignments"}
        className={`tab ${activeView === "assignments" ? "tab-active" : ""}`}
        onClick={() => onSelectView("assignments")}
      >
        Assignments
      </button>
      {preview && (
        <button
          role="tab"
          aria-selected={activeView === "preview"}
          className={`tab ${activeView === "preview" ? "tab-active" : ""}`}
          onClick={() => onSelectView("preview")}
        >
          Preview ({preview.assignments.length})
        </button>
      )}
    </div>
  );
}

export function PlanPreviewNotice({
  preview,
  isDeadlinePassed,
}: {
  preview: PlanPreview;
  isDeadlinePassed: boolean;
}) {
  const message = isDeadlinePassed
    ? "Requests are now closed. Calculate plan again to save a draft from the latest data."
    : "Requests may change. Calculate again to refresh this snapshot.";

  return (
    <div className="alert alert-info alert-soft" role="status">
      <div>
        <p className="font-semibold">Preview only · Not saved</p>
        <p className="text-sm">
          Calculated {new Date(preview.calculatedAt).toLocaleString("en-GB")}. {message} This preview disappears when you leave this month.
        </p>
      </div>
    </div>
  );
}
