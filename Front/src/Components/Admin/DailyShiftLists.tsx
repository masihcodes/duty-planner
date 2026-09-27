import { Trash2 } from "lucide-react";
import type { AssignmentInput, CalculatedShift, ShiftEntry, TeamMember } from "../../Utils/Types";

interface DailyRequestsProps {
  requests: ShiftEntry[];
  assignments: ShiftEntry[];
  members: TeamMember[];
  isDraft: boolean;
  isBusy: boolean;
  onAssign: (assignment: AssignmentInput) => void;
}

export function DailyRequests({
  requests,
  assignments,
  members,
  isDraft,
  isBusy,
  onAssign,
}: DailyRequestsProps) {
  return (
    <section>
      <h3 className="mb-2 font-semibold">Requests for this day</h3>
      {requests.length === 0 && <p className="text-sm text-base-content/60">No requests.</p>}
      <ul className="list">
        {requests.map((request) => {
          const isAssigned = assignments.some((assignment) =>
            assignment.userId === request.userId &&
            assignment.date === request.date &&
            assignment.shiftType === request.shiftType,
          );
          const isActiveMember = members.some((member) => member.id === request.userId);

          return (
            <li key={request.id} className="list-row items-center px-0 py-3">
              <div className="list-col-grow">
                <p>{request.name}</p>
                <p className="text-xs capitalize text-base-content/60">
                  {request.shiftType}{!isActiveMember && " · inactive"}
                </p>
              </div>
              {isDraft && (
                <button
                  className="btn btn-sm btn-outline"
                  disabled={isAssigned || !isActiveMember || isBusy}
                  onClick={() => onAssign({
                    userId: request.userId,
                    date: request.date,
                    shiftType: request.shiftType,
                  })}
                >
                  {isAssigned ? "Assigned" : "Assign"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface DailyAssignmentsProps {
  assignments: (ShiftEntry | CalculatedShift)[];
  isPreview: boolean;
  isDraft: boolean;
  isBusy: boolean;
  onRemove: (assignmentId: number) => void;
}

export function DailyAssignments({
  assignments,
  isPreview,
  isDraft,
  isBusy,
  onRemove,
}: DailyAssignmentsProps) {
  return (
    <section>
      <h3 className="mb-2 font-semibold">
        {isPreview ? "Preview for this day" : "Assignments for this day"}
      </h3>
      {assignments.length === 0 && <p className="text-sm text-base-content/60">No assignments.</p>}
      <ul className="list">
        {assignments.map((assignment) => (
          <li key={`${assignment.userId}/${assignment.shiftType}`} className="list-row items-center px-0 py-3">
            <div className="list-col-grow">
              <p>{assignment.name}</p>
              <p className="text-xs capitalize text-base-content/60">{assignment.shiftType}</p>
            </div>
            {/* Preview entries have no database ID and cannot be removed. */}
            {isDraft && "id" in assignment && (
              <button
                className="btn btn-sm btn-ghost text-error"
                aria-label={`Remove ${assignment.name} ${assignment.shiftType} assignment`}
                disabled={isBusy}
                onClick={() => onRemove(assignment.id)}
              >
                <Trash2 size={17} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
