import { create } from "zustand";
import type { PlannerState, User } from "./Types";

function emptyUser(): User {
  return {
    id: 0,
    name: "",
    email: "",
    role: "user",
    createdAt: "",
    isActive: true,
  };
}

export const usePlanerStore = create<PlannerState>()(() => ({
  user: emptyUser(),
  allPlansMonth: [],
}));

export function setUser(user: User) {
  usePlanerStore.setState({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      isActive: user.isActive,
    },
  });
}

export function resetUser() {
  usePlanerStore.setState({ user: emptyUser() });
}

export function resetAllPlans() {
  usePlanerStore.setState({ allPlansMonth: [] });
}

export function setAllPlans(months: string[]) {
  usePlanerStore.setState({ allPlansMonth: months });
}
