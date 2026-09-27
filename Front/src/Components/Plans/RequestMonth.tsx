import { useState } from "react";
import { Info } from "lucide-react";
import { useOpenPlan, useRequestChange } from "../../API/useOpenPlansQueries";
import { usePlanDeadline } from "../../Hooks/usePlanDeadline";
import { shifts } from "../../Utils/Constants";
import { dayDate, dayLabel, monthLabel } from "../../Utils/planDates";
import { entriesForDay } from "../../Utils/planEntries";
import type { ShiftEntry, ShiftType } from "../../Utils/Types";
import { usePlanerStore } from "../../Utils/usePlanerStore";
import QueryFeedback from "../QueryFeedback";
import ShiftCalendar from "../ShiftCalendar";

export default function RequestMonth({ id }: { id: number }) {
  const planQuery = useOpenPlan(id);
  const requestMutation = useRequestChange(id);
  const userId = usePlanerStore((state) => state.user.id);
  const [selectedDay, setSelectedDay] = useState(1);
  const isDeadlinePassed = usePlanDeadline(planQuery.data, planQuery.dataUpdatedAt);

  if (planQuery.isPending) return <QueryFeedback />;
  if (planQuery.isError) {
    return <QueryFeedback error={planQuery.error} retry={() => planQuery.refetch()} />;
  }

  const { plan, requests } = planQuery.data;
  const selectedDate = dayDate(plan.month, selectedDay);
  const dailyRequests = entriesForDay(requests, selectedDate);
  const myRequestCount = requests.filter((entry) => entry.userId === userId).length;
  const requestNotice = isDeadlinePassed
    ? "The selection window has ended. Your preferences are saved for your manager's review."
    : "Preferences are requests, not confirmed shifts. You can request a shift even if a colleague has chosen it.";

  function handleToggleRequest(shiftType: ShiftType, requestId?: number) {
    requestMutation.mutate(
      requestId === undefined
        ? { add: { date: selectedDate, shiftType } }
        : { remove: requestId },
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">{monthLabel(plan.month)}</h2>
        <span className={`badge h-auto py-2 ${isDeadlinePassed ? "badge-neutral" : "badge-warning badge-soft"}`}>
          {isDeadlinePassed ? "Requests closed" : "Submit by"} · {new Date(plan.selectionDeadline).toLocaleString("en-GB")}
        </span>
      </div>
      <div className="alert alert-info alert-soft">
        <Info size={20} /><span>{requestNotice}</span>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ShiftCalendar
          month={plan.month}
          entries={requests}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          userId={userId}
        />
        <aside className="card card-border bg-base-200 shadow-xl">
          <div className="card-body gap-4">
            <span className="text-sm text-primary">{myRequestCount} of your requests saved</span>
            <h2 className="card-title">{dayLabel(selectedDate)}</h2>
            {shifts.map((shift) => (
              <RequestShiftCard
                key={shift.name}
                shift={shift}
                entries={dailyRequests.filter((entry) => entry.shiftType === shift.name)}
                userId={userId}
                disabled={isDeadlinePassed || requestMutation.isPending}
                onToggle={handleToggleRequest}
              />
            ))}
            {requestMutation.isPending && (
              <p className="text-sm" role="status">Saving your preferences…</p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

interface RequestShiftCardProps {
  shift: (typeof shifts)[number];
  entries: ShiftEntry[];
  userId: number;
  disabled: boolean;
  onToggle: (shiftType: ShiftType, requestId?: number) => void;
}

function RequestShiftCard({ shift, entries, userId, disabled, onToggle }: RequestShiftCardProps) {
  const { name, icon: Icon } = shift;
  const myRequest = entries.find((entry) => entry.userId === userId);
  const requesterNames = entries.map((entry) => entry.userId === userId ? "You" : entry.name);
  const requestSummary = entries.length ? requesterNames.join(", ") : "No requests yet";
  const buttonClass = myRequest ? "btn-outline btn-error" : "btn-primary";
  const buttonLabel = myRequest ? `Remove ${name} request` : `Request ${name}`;

  return (
    <div className="card card-border bg-base-100">
      <div className="card-body gap-3 p-4">
        <h3 className="flex items-center gap-2 font-semibold capitalize">
          <Icon size={20} className="text-primary" />{name}
        </h3>
        <p className="text-sm text-base-content/70">{requestSummary}</p>
        <button
          type="button"
          className={`btn btn-sm ${buttonClass}`}
          disabled={disabled}
          onClick={() => onToggle(name, myRequest?.id)}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
