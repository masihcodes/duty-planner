import { useEffect, useState } from "react";
import type { OpenPlanData } from "../Utils/Types";

type DeadlineData = Pick<OpenPlanData, "plan" | "serverTime">;

export function usePlanDeadline(data: DeadlineData | undefined, dataUpdatedAt: number) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!data) return false;

  // Anchor the live clock to the latest response, preserving the server/client offset.
  const serverOffset = Date.parse(data.serverTime) - dataUpdatedAt;
  const serverNow = now + serverOffset;

  return serverNow >= Date.parse(data.plan.selectionDeadline);
}
