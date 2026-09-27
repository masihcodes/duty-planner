import { ClipboardCheck } from "lucide-react";
import { useAdminPlans } from "../API/useAdminPlansQueries";
import AdminMonth from "../Components/Admin/AdminMonth";
import CreatePlanForm from "../Components/Admin/CreatePlanForm";
import QueryFeedback from "../Components/QueryFeedback";
import { useSelectedPlan } from "../Hooks/useSelectedPlan";
import { monthLabel } from "../Utils/planDates";

export default function Admin() {
  const plansQuery = useAdminPlans();
  const { selectedPlan, selectPlan } = useSelectedPlan(plansQuery.data);

  let content;
  if (plansQuery.isPending) {
    content = <QueryFeedback />;
  } else if (plansQuery.isError) {
    content = <QueryFeedback error={plansQuery.error} retry={() => plansQuery.refetch()} />;
  } else if (!selectedPlan) {
    content = <div className="alert alert-soft">Create the first plan to start collecting requests.</div>;
  } else {
    content = (
      <>
        <label className="flex flex-wrap items-center gap-3">
          Manage month
          <select
            className="select w-72"
            aria-label="Manage month"
            value={selectedPlan.id}
            onChange={(event) => selectPlan(Number(event.target.value))}
          >
            {plansQuery.data?.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {monthLabel(plan.month)} · {plan.status}
              </option>
            ))}
          </select>
        </label>
        {/* Day, form values, and the unsaved preview belong to this plan only. */}
        <AdminMonth key={selectedPlan.id} id={selectedPlan.id} />
      </>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 sm:p-8">
      <header>
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <ClipboardCheck className="text-primary" />Plan management
        </h1>
        <p className="mt-2 text-base-content/70">
          Open a month, review preferences and prepare your team's schedule.
        </p>
      </header>
      <CreatePlanForm onCreated={selectPlan} />
      {content}
    </main>
  );
}
