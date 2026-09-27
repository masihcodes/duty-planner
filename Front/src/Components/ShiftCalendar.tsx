import { shiftLabels, weekdays } from "../Utils/Constants";
import { dayDate, generateCalendarMonth, monthLabel } from "../Utils/planDates";
import { entriesForDay } from "../Utils/planEntries";
import type { CalculatedShift } from "../Utils/Types";

interface ShiftCalendarProps {
  month: string;
  entries: CalculatedShift[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  userId: number;
}

const MAX_VISIBLE_ENTRIES = 3;

export default function ShiftCalendar({
  month,
  entries,
  selectedDay,
  onSelectDay,
  userId,
}: ShiftCalendarProps) {
  const [year, monthNumber] = month.split("-").map(Number);
  const weeks = generateCalendarMonth(year, monthNumber);

  return (
    <div className="card card-border min-w-0 bg-base-200 shadow-xl">
      <div className="card-body gap-4 p-2 sm:p-5">
        <table className="table w-full table-fixed [&_td]:p-0.5 [&_th]:px-0 [&_th]:text-center">
          <caption className="sr-only">
            {monthLabel(month)} shifts. Select a day to see details.
          </caption>
          <thead>
            <tr>
              {weekdays.map((weekday) => (
                <th key={weekday} scope="col">{weekday}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((day, column) => (
                  <td key={column}>
                    {day && (
                      <CalendarDay
                        day={day}
                        date={dayDate(month, day)}
                        entries={entriesForDay(entries, dayDate(month, day))}
                        isSelected={selectedDay === day}
                        onSelectDay={onSelectDay}
                        userId={userId}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-wrap gap-3 text-xs text-base-content/70">
          <span>AM · Morning</span>
          <span>PM · Afternoon</span>
          <span>N · Night</span>
          <span className="badge badge-primary badge-sm">Your shifts</span>
        </div>
      </div>
    </div>
  );
}

interface CalendarDayProps {
  day: number;
  date: string;
  entries: CalculatedShift[];
  isSelected: boolean;
  onSelectDay: (day: number) => void;
  userId: number;
}

function CalendarDay({ day, date, entries, isSelected, onSelectDay, userId }: CalendarDayProps) {
  const visibleEntries = entries.slice(0, MAX_VISIBLE_ENTRIES);
  const remainingCount = entries.length - visibleEntries.length;
  const selectionClass = isSelected
    ? "btn-primary"
    : "btn-ghost bg-rose-950/20 hover:bg-rose-950/60";

  return (
    <button
      type="button"
      aria-label={`${date}, ${entries.length} entries`}
      aria-pressed={isSelected}
      onClick={() => onSelectDay(day)}
      className={`btn h-32 w-full flex-col items-stretch justify-start gap-1 px-1 py-2 font-normal sm:px-2 ${selectionClass}`}
    >
      <span className="text-left font-semibold">{day}</span>
      {visibleEntries.map((entry) => (
        <ShiftBadge
          key={`${entry.userId}/${entry.date}/${entry.shiftType}`}
          entry={entry}
          isCurrentUser={entry.userId === userId}
        />
      ))}
      {remainingCount > 0 && <span className="text-xs">+{remainingCount} more</span>}
    </button>
  );
}

function ShiftBadge({ entry, isCurrentUser }: { entry: CalculatedShift; isCurrentUser: boolean }) {
  const badgeClass = isCurrentUser ? "badge-primary" : "badge-secondary badge-soft";
  const displayName = isCurrentUser ? "You" : entry.name;

  return (
    <span className={`badge badge-sm w-full justify-start overflow-hidden px-1 ${badgeClass}`}>
      <span className="truncate">{displayName} · {shiftLabels[entry.shiftType]}</span>
    </span>
  );
}
