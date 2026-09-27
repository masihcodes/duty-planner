import { CalendarClock, Info } from "lucide-react";
import { useOpenPlans } from "../API/useOpenPlansQueries";
import RequestMonth from "../Components/Plans/RequestMonth";
import QueryFeedback from "../Components/QueryFeedback";
import { useSelectedPlan } from "../Hooks/useSelectedPlan";
import { monthLabel } from "../Utils/planDates";

export default function OpenPlan() {
  const plansQuery = useOpenPlans();
  const { selectedPlan, selectPlan } = useSelectedPlan(plansQuery.data);

  let content;
  if (plansQuery.isPending) {
    content = <QueryFeedback />;
  } else if (plansQuery.isError) {
    content = <QueryFeedback error={plansQuery.error} retry={() => plansQuery.refetch()} />;
  } else if (!selectedPlan) {
    content = (
      <div className="alert alert-soft">
        <Info size={20} />There is no plan collecting requests right now. Check back when your manager opens one.
      </div>
    );
  } else {
    content = <RequestMonth key={selectedPlan.id} id={selectedPlan.id} />;
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold">
            <CalendarClock className="text-primary" />Open Plan
          </h1>
          <p className="mt-2 text-base-content/70">
            Share your preferences and see what your colleagues have requested.
          </p>
        </div>
        {selectedPlan && (
          <select
            className="select w-52"
            aria-label="Request month"
            value={selectedPlan.id}
            onChange={(event) => selectPlan(Number(event.target.value))}
          >
            {plansQuery.data?.map((plan) => (
              <option key={plan.id} value={plan.id}>{monthLabel(plan.month)}</option>
            ))}
          </select>
        )}
      </header>
      {content}
    </main>
  );
}
