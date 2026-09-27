import { useState, type SubmitEvent } from "react";
import { CalendarPlus } from "lucide-react";
import { useCreatePlan } from "../../API/useAdminPlansQueries";
import { localDateTime } from "../../Utils/planDates";

const DEFAULT_SELECTION_WINDOW_MS = 15 * 24 * 60 * 60 * 1000;

function nextMonthInputValue() {
  const nextMonth = new Date();
  nextMonth.setDate(1);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return localDateTime(nextMonth).slice(0, 7);
}

export default function CreatePlanForm({ onCreated }: { onCreated: (id: number) => void }) {
  const createMutation = useCreatePlan();
  const [month, setMonth] = useState(nextMonthInputValue);
  const [deadline, setDeadline] = useState(() =>
    localDateTime(new Date(Date.now() + DEFAULT_SELECTION_WINDOW_MS)),
  );

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const createdPlan = await createMutation.mutateAsync({
        month: `${month}-01`,
        selectionDeadline: new Date(deadline).toISOString(),
      });
      onCreated(createdPlan.id);
    } catch {
      // The mutation displays the server error; keep the entered form values.
    }
  }

  return (
    <details className="collapse collapse-arrow border border-base-300 bg-base-200">
      <summary className="collapse-title font-semibold">
        <span className="inline-flex items-center gap-2">
          <CalendarPlus size={20} />Create a monthly plan
        </span>
      </summary>
      <div className="collapse-content">
        <form className="flex flex-wrap items-end gap-4" onSubmit={handleSubmit}>
          <label className="fieldset min-w-0 w-full sm:w-auto">
            <span className="fieldset-legend">Plan month</span>
            <input
              type="month"
              className="input w-full"
              required
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </label>
          <label className="fieldset min-w-0 w-full sm:w-auto">
            <span className="fieldset-legend">Selection deadline (your local time)</span>
            <input
              type="datetime-local"
              className="input w-full"
              required
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
            />
          </label>
          <button className="btn btn-primary mb-1" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating…" : "Create plan"}
          </button>
        </form>
        <p className="mt-2 text-sm text-base-content/60">
          Requests open immediately. The default deadline gives the team 15 days.
        </p>
      </div>
    </details>
  );
}
