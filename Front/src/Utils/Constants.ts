import { Moon, Sun, Sunset } from "lucide-react";
import type { ShiftType } from "./Types";

export const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const shifts = [
  { name: "morning", icon: Sun },
  { name: "afternoon", icon: Sunset },
  { name: "night", icon: Moon },
] satisfies { name: ShiftType; icon: typeof Sun }[];

export const shiftLabels: Record<ShiftType, string> = {
  morning: "AM",
  afternoon: "PM",
  night: "N",
};
