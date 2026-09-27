import { useState } from "react";
import { useMonthlyPlan } from "../../API/usePlanQueries";
import { shifts } from "../../Utils/Constants";
import { dayDate, dayLabel } from "../../Utils/planDates";
import { entriesForDay } from "../../Utils/planEntries";
import { usePlanerStore } from "../../Utils/usePlanerStore";
import QueryFeedback from "../QueryFeedback";
import ShiftCalendar from "../ShiftCalendar";

export default function PublishedMonth({ id }: { id: number }) {
  const planQuery = useMonthlyPlan(id);
  const userId = usePlanerStore((state) => state.user.id);
  const [selectedDay, setSelectedDay] = useState(1);

  if (planQuery.isPending) return <QueryFeedback />;
  if (planQuery.isError) {
    return <QueryFeedback error={planQuery.error} retry={() => planQuery.refetch()} />;
  }

  const { plan, assignments } = planQuery.data;
  const selectedDate = dayDate(plan.month, selectedDay);
  const dailyAssignments = entriesForDay(assignments, selectedDate);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <ShiftCalendar
        month={plan.month}
        entries={assignments}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        userId={userId}
      />
      <aside className="card card-border bg-base-200 shadow-xl">
        <div className="card-body">
          <span className="badge badge-success badge-soft">Published</span>
          <h2 className="card-title">{dayLabel(selectedDate)}</h2>
          {shifts.map(({ name, icon: Icon }) => {
            const shiftAssignments = dailyAssignments.filter((entry) => entry.shiftType === name);

            return (
              <div key={name} className="rounded-box bg-base-100 p-4">
                <h3 className="mb-2 flex items-center gap-2 font-semibold capitalize">
                  <Icon size={18} className="text-primary" />{name}
                </h3>
                {shiftAssignments.map((entry) => (
                  <p
                    key={entry.id}
                    className={entry.userId === userId ? "text-primary font-semibold" : ""}
                  >
                    {entry.name}{entry.userId === userId && " (You)"}
                  </p>
                ))}
                {shiftAssignments.length === 0 && (
                  <p className="text-base-content/60">No assignment</p>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
