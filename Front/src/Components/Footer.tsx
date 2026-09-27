import { CalendarClock, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer flex flex-col items-center gap-3 bg-base-200 p-4 text-center text-base-content sm:flex-row sm:justify-between">
      <div className="flex items-center gap-2">
        <CalendarClock size={28} className="shrink-0 text-primary" />
        <p>DutyPlanner ◉ Hospital duty planning</p>
      </div>
      <p className="flex flex-wrap items-center justify-center gap-2 text-sm text-base-content/70">
        © {new Date().getFullYear()}
        <span>Built with</span>
        <Heart className="w-4 h-4 text-rose-500/70 fill-rose-500/20" />
        <span>using React & Tailwind</span>
      </p>
    </footer>
  );
}
