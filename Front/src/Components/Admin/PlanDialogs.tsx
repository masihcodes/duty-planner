import type { RefObject } from "react";
import { monthLabel } from "../../Utils/planDates";
import type { PlanRecord } from "../../Utils/Types";

interface PlanDialogsProps {
  plan: PlanRecord;
  requestCount: number;
  assignmentCount: number;
  unfilledCount: number;
  isBusy: boolean;
  isDeleting: boolean;
  deleteDialogRef: RefObject<HTMLDialogElement | null>;
  publishDialogRef: RefObject<HTMLDialogElement | null>;
  onDelete: () => void;
  onPublish: () => void;
}

export default function PlanDialogs({
  plan,
  requestCount,
  assignmentCount,
  unfilledCount,
  isBusy,
  isDeleting,
  deleteDialogRef,
  publishDialogRef,
  onDelete,
  onPublish,
}: PlanDialogsProps) {
  return (
    <>
      <dialog
        ref={deleteDialogRef}
        className="modal"
        aria-labelledby={`delete-plan-title-${plan.id}`}
        onCancel={(event) => {
          if (isBusy) event.preventDefault();
        }}
      >
        <div className="modal-box bg-base-200">
          <h3 id={`delete-plan-title-${plan.id}`} className="text-lg font-bold">
            Delete {monthLabel(plan.month)}?
          </h3>
          <p className="py-4">
            This permanently deletes this plan, all {requestCount} shift requests and all {assignmentCount} assignments. You can then create a new plan for the same month.
          </p>
          {plan.status === "published" && (
            <p className="text-warning">
              The published schedule will also be removed from the team’s calendar and future workload history.
            </p>
          )}
          <div className="modal-action">
            <button
              type="button"
              className="btn"
              disabled={isBusy}
              onClick={() => deleteDialogRef.current?.close()}
            >
              Cancel
            </button>
            <button type="button" className="btn btn-error" disabled={isBusy} onClick={onDelete}>
              {isDeleting ? (
                <><span className="loading loading-spinner loading-sm" aria-hidden="true" />Deleting…</>
              ) : "Delete plan"}
            </button>
          </div>
        </div>
      </dialog>
      <dialog ref={publishDialogRef} className="modal">
        <div className="modal-box bg-base-200">
          <h3 className="text-lg font-bold">Publish {monthLabel(plan.month)}?</h3>
          <p className="py-4">
            The team will see these assignments, and editing will be locked. Confirm that you have reviewed the schedule.
          </p>
          {unfilledCount > 0 && (
            <div className="alert alert-warning alert-soft">
              {unfilledCount} shifts have no assignee. Check whether this is intentional before publishing.
            </div>
          )}
          <div className="modal-action">
            <button className="btn" disabled={isBusy} onClick={() => publishDialogRef.current?.close()}>
              Cancel
            </button>
            <button className="btn btn-success" disabled={isBusy} onClick={onPublish}>
              Confirm publication
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
