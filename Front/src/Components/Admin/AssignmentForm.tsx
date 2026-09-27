import { shifts } from "../../Utils/Constants";
import type { ShiftType, TeamMember } from "../../Utils/Types";

interface AssignmentFormProps {
  members: TeamMember[];
  assigneeId: string;
  shiftType: ShiftType;
  isBusy: boolean;
  onAssigneeChange: (assigneeId: string) => void;
  onShiftTypeChange: (shiftType: ShiftType) => void;
  onAssign: () => void;
}

export default function AssignmentForm({
  members,
  assigneeId,
  shiftType,
  isBusy,
  onAssigneeChange,
  onShiftTypeChange,
  onAssign,
}: AssignmentFormProps) {
  return (
    <form
      className="space-y-3 rounded-box bg-base-100 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        onAssign();
      }}
    >
      <h3 className="font-semibold">Add assignment</h3>
      <select
        className="select w-full"
        aria-label="Assign colleague"
        required
        value={assigneeId}
        onChange={(event) => onAssigneeChange(event.target.value)}
      >
        <option value="" disabled>Choose a colleague</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>{member.name}</option>
        ))}
      </select>
      <select
        className="select w-full capitalize"
        aria-label="Assignment shift"
        value={shiftType}
        onChange={(event) => onShiftTypeChange(event.target.value as ShiftType)}
      >
        {shifts.map((shift) => (
          <option key={shift.name} value={shift.name}>{shift.name}</option>
        ))}
      </select>
      <button className="btn btn-primary btn-block" disabled={isBusy || !assigneeId}>
        Add assignment
      </button>
      <p className="text-xs text-base-content/60">
        All active colleagues are available, including those without requests.
      </p>
    </form>
  );
}
