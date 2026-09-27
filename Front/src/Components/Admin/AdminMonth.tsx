import { useRef, useState } from "react";
import {
  useAdminPlan,
  useAdminPlanAction,
  useCalculatePlan,
  useTeamMembers,
} from "../../API/useAdminPlansQueries";
import { usePlanDeadline } from "../../Hooks/usePlanDeadline";
import { dayDate, dayLabel } from "../../Utils/planDates";
import { countUnfilledShifts, entriesForDay } from "../../Utils/planEntries";
import type { AssignmentInput, CalculatedShift, ShiftEntry, ShiftType } from "../../Utils/Types";
import { usePlanerStore } from "../../Utils/usePlanerStore";
import QueryFeedback from "../QueryFeedback";
import ShiftCalendar from "../ShiftCalendar";
import AssignmentForm from "./AssignmentForm";
import { DailyAssignments, DailyRequests } from "./DailyShiftLists";
import PlanDialogs from "./PlanDialogs";
import PlanOverview from "./PlanOverview";
import { PlanPreviewNotice, PlanViewTabs, type PlanView } from "./PlanViews";

export default function AdminMonth({ id }: { id: number }) {
  const planQuery = useAdminPlan(id);
  const membersQuery = useTeamMembers();
  const planMutation = useAdminPlanAction(id);
  const calculationMutation = useCalculatePlan(id);
  const userId = usePlanerStore((state) => state.user.id);

  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedView, setSelectedView] = useState<PlanView | null>(null);
  // Keep form state here so hiding the draft form does not reset the user's choices.
  const [assigneeId, setAssigneeId] = useState("");
  const [shiftType, setShiftType] = useState<ShiftType>("morning");
  const publishDialogRef = useRef<HTMLDialogElement>(null);
  const deleteDialogRef = useRef<HTMLDialogElement>(null);
  const isDeadlinePassed = usePlanDeadline(planQuery.data, planQuery.dataUpdatedAt);
  const isBusy = planMutation.isPending || calculationMutation.isPending;

  if (planQuery.isPending || membersQuery.isPending) return <QueryFeedback />;
  if (planQuery.isError) {
    return <QueryFeedback error={planQuery.error} retry={() => planQuery.refetch()} />;
  }
  if (membersQuery.isError) {
    return <QueryFeedback error={membersQuery.error} retry={() => membersQuery.refetch()} />;
  }

  const { plan, requests, assignments } = planQuery.data;
  const members = membersQuery.data;
  const isDraft = plan.status === "draft";
  const preview = plan.status === "collecting" && calculationMutation.data?.mode === "preview"
    ? calculationMutation.data
    : null;

  // Fall back to the status-appropriate tab when a preview is cleared or no longer applies.
  const defaultView = plan.status === "collecting" ? "requests" : "assignments";
  const canShowSelectedView = selectedView && (selectedView !== "preview" || preview);
  const activeView = canShowSelectedView ? selectedView : defaultView;
  const isShowingPreview = activeView === "preview";
  const shownAssignments: (ShiftEntry | CalculatedShift)[] = isShowingPreview && preview
    ? preview.assignments
    : assignments;
  const calendarEntries = activeView === "requests" ? requests : shownAssignments;

  const selectedDate = dayDate(plan.month, selectedDay);
  const dailyRequests = entriesForDay(requests, selectedDate);
  const dailyAssignments = entriesForDay(shownAssignments, selectedDate);
  const unfilledCount = countUnfilledShifts(plan.month, assignments);

  function handleUpdateDeadline(selectionDeadline: string) {
    planMutation.mutate(
      { kind: "deadline", selectionDeadline },
      { onSuccess: () => calculationMutation.reset() },
    );
  }

  function handleCalculate() {
    calculationMutation.mutate(undefined, {
      onSuccess: (result) => setSelectedView(result.mode === "preview" ? "preview" : "assignments"),
    });
  }

  function handleAssign(assignment: AssignmentInput) {
    planMutation.mutate({ kind: "assign", assignment });
  }

  function handlePublish() {
    planMutation.mutate(
      { kind: "publish" },
      { onSuccess: () => publishDialogRef.current?.close() },
    );
  }

  return (
    <>
      <PlanOverview
        plan={plan}
        requestCount={requests.length}
        assignmentCount={assignments.length}
        unfilledCount={unfilledCount}
        hasTeamMembers={members.length > 0}
        isBusy={isBusy}
        isCalculating={calculationMutation.isPending}
        isDeadlinePassed={isDeadlinePassed}
        onDelete={() => deleteDialogRef.current?.showModal()}
        onPublish={() => publishDialogRef.current?.showModal()}
        onCalculate={handleCalculate}
        onUpdateDeadline={handleUpdateDeadline}
      />
      <PlanViewTabs activeView={activeView} preview={preview} onSelectView={setSelectedView} />
      {isShowingPreview && preview && (
        <PlanPreviewNotice preview={preview} isDeadlinePassed={isDeadlinePassed} />
      )}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <ShiftCalendar
          month={plan.month}
          entries={calendarEntries}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          userId={userId}
        />
        <aside className="card card-border bg-base-200 shadow-xl">
          <div className="card-body gap-5">
            <h2 className="card-title">{dayLabel(selectedDate)}</h2>
            {isDraft && (
              <AssignmentForm
                members={members}
                assigneeId={assigneeId}
                shiftType={shiftType}
                isBusy={isBusy}
                onAssigneeChange={setAssigneeId}
                onShiftTypeChange={setShiftType}
                onAssign={() => handleAssign({
                  date: selectedDate,
                  shiftType,
                  userId: Number(assigneeId),
                })}
              />
            )}
            <DailyRequests
              requests={dailyRequests}
              assignments={assignments}
              members={members}
              isDraft={isDraft}
              isBusy={isBusy}
              onAssign={handleAssign}
            />
            <DailyAssignments
              assignments={dailyAssignments}
              isPreview={isShowingPreview}
              isDraft={isDraft}
              isBusy={isBusy}
              onRemove={(assignmentId) => planMutation.mutate({ kind: "remove", assignmentId })}
            />
          </div>
        </aside>
      </div>
      <PlanDialogs
        plan={plan}
        requestCount={requests.length}
        assignmentCount={assignments.length}
        unfilledCount={unfilledCount}
        isBusy={isBusy}
        isDeleting={isBusy && planMutation.variables?.kind === "delete"}
        deleteDialogRef={deleteDialogRef}
        publishDialogRef={publishDialogRef}
        onDelete={() => planMutation.mutate({ kind: "delete" })}
        onPublish={handlePublish}
      />
    </>
  );
}
