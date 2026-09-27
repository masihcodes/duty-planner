import { CalendarCheck2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAllPlans } from "../API/usePlanQueries";
import PublishedMonth from "../Components/Plans/PublishedMonth";
import QueryFeedback from "../Components/QueryFeedback";
import { useSelectedPlan } from "../Hooks/useSelectedPlan";
import { monthLabel } from "../Utils/planDates";

export default function Plans() {
  const plansQuery = useAllPlans();
  const { selectedPlan, selectPlan } = useSelectedPlan(plansQuery.data);

  let content;
  if (plansQuery.isPending) {
    content = <QueryFeedback />;
  } else if (plansQuery.isError) {
    content = <QueryFeedback error={plansQuery.error} retry={() => plansQuery.refetch()} />;
  } else if (!selectedPlan) {
    content = (
      <div className="alert alert-soft">
        No plans have been published yet. You can still check Open Plan for requests.
      </div>
    );
  } else {
    content = (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">{monthLabel(selectedPlan.month)}</h2>
          <label className="flex items-center gap-3">
            Month
            <select
              className="select w-52"
              aria-label="Published month"
              value={selectedPlan.id}
              onChange={(event) => selectPlan(Number(event.target.value))}
            >
              {plansQuery.data?.map((plan) => (
                <option key={plan.id} value={plan.id}>{monthLabel(plan.month)}</option>
              ))}
            </select>
          </label>
        </div>
        {/* A different plan starts with its own day selection. */}
        <PublishedMonth key={selectedPlan.id} id={selectedPlan.id} />
      </>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <CalendarCheck2 className="text-primary" />Published plans
          </h1>
          <p className="mt-2 text-base-content/70">
            Your team's confirmed shifts, month by month.
          </p>
        </div>
        <Link to="/openPlan" className="btn btn-primary">Request shifts</Link>
      </header>
      {content}
    </main>
  );
}
