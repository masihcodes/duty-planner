import {
  CalendarCheck2,
  CalendarClock,
  CalendarCog,
  ShieldCheck,
  HomeIcon,
  LogIn,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLogout } from "../API/useAuthQueries";
import { openAuthDialog } from "../Utils/authDialogs";
import type { User } from "../Utils/Types";
import { usePlanerStore } from "../Utils/usePlanerStore";

const navigationLinks = [
  { to: "/", label: "Home", icon: HomeIcon },
  { to: "/plans", label: "Plans", icon: CalendarCheck2 },
  { to: "/openPlan", label: "Open Plan", icon: CalendarClock },
  { to: "/admin/plans", label: "Admin", icon: ShieldCheck, adminOnly: true },
];

function navigationLinkClass({ isActive }: { isActive: boolean }) {
  return `flex gap-1 btn btn-ghost px-2 sm:px-3 text-sm sm:text-base ${!isActive ? "text-slate-600 hover:text-white" : ""}`;
}

export default function Navbar() {
  const user = usePlanerStore((state) => state.user);
  const logoutMutation = useLogout();
  const visibleLinks = navigationLinks.filter((link) => !link.adminOnly || user.role === "admin");

  return (
    <nav className="navbar flex-wrap sm:flex-nowrap gap-y-2 bg-base-200 px-4 shadow-sm sticky top-0 z-20">
      <div className="navbar-start space-x-2">
        <CalendarCog className="text-primary" size={24} />
        <p className="text-lg sm:text-xl">DutyPlanner</p>
      </div>
      <div className="navbar-center flex-wrap sm:flex-nowrap order-3 w-full justify-center sm:order-0 sm:w-auto">
        {visibleLinks.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={navigationLinkClass}>
            <Icon className="text-primary" size={24} />{label}
          </NavLink>
        ))}
      </div>
      <div className="navbar-end ml-auto">
        {user?.name ? (
          <UserMenu user={user} onLogout={() => logoutMutation.mutate()} />
        ) : (
          <button
            className="btn btn-primary btn-outline gap-2"
            onClick={() => openAuthDialog("sign-in-modal")}
          >
            <LogIn size={20} /> Sign In
          </button>
        )}
      </div>
    </nav>
  );
}

function UserMenu({ user, onLogout }: { user: User; onLogout: () => void }) {
  const isAdmin = user.role === "admin";

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
        <div className="w-10 rounded-full bg-purple-950 text-neutral-content ring-primary ring-offset-base-100 ring-2 ring-offset-2 flex items-center justify-center animate-pulse">
          <span className="text-lg font-extrabold text-primary">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
      <ul className="menu dropdown-content menu-md z-30 mt-3 w-56 p-2 shadow-lg bg-base-200 border border-base-300 rounded-box gap-1">
        <li className="menu-title px-3 py-2 border-b border-base-300 mb-1">
          <div className="flex flex-col gap-1 items-start">
            <span className="font-bold text-base text-base-content">{user.name}</span>
            <div className="flex items-center gap-2">
              <span className={`badge badge-sm ${isAdmin ? "badge-primary" : "badge-secondary badge-soft"}`}>
                {isAdmin ? "Admin" : "User"}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-base-content/70">
                <span className={`inline-block h-2 w-2 rounded-full ${isAdmin ? "bg-primary" : "bg-success"}`} />
                Online
              </span>
            </div>
          </div>
        </li>
        <li>
          <button onClick={onLogout} className="text-error hover:bg-error/10 flex items-center justify-between">
            <span>Sign Out</span>
            <LogOut size={18} />
          </button>
        </li>
      </ul>
    </div>
  );
}
