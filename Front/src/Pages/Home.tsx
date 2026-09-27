import { ArrowRight, CalendarDays, ClipboardCheck, Scale } from "lucide-react";
import { openAuthDialog } from "../Utils/authDialogs";

const steps = [
  {
    icon: CalendarDays,
    title: "Share your preferences",
    text: "Choose the days that work for you.",
  },
  {
    icon: Scale,
    title: "Make room for fairness",
    text: "Balance duties across the team.",
  },
  {
    icon: ClipboardCheck,
    title: "Review the monthly plan",
    text: "A shared schedule, reviewed by your manager.",
  },
];

export default function Home() {
  return (
    <section className="hero flex-1 bg-base-100 px-4 py-12 sm:py-20">
      <div className="hero-content w-full max-w-6xl flex-col gap-12 lg:flex-row lg:gap-20">
        <div className="flex-1">
          <span className="badge badge-primary badge-outline mb-6">Made for hospital teams</span>
          <h1 className="text-4xl leading-tight font-bold sm:text-6xl">
            Every shift.<br />
            Every person.<br />
            <span className="text-primary">One clear plan.</span>
          </h1>
          <p className="max-w-lg py-6 text-lg text-base-content/75">
            Bring preferences, fair rotation, and your monthly duty schedule together in one place.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openAuthDialog("sign-up-modal")}
          >
            Create your account <ArrowRight size={18} />
          </button>
        </div>
        <article tabIndex={-1} className="card card-border w-full max-w-md bg-base-200 shadow-2xl">
          <div className="card-body gap-5 p-6 sm:p-8">
            <span className="badge badge-secondary badge-soft">The monthly workflow</span>
            <h2 className="card-title text-2xl">Better planning starts here.</h2>
            <ul className="list">
              {steps.map(({ icon: Icon, title, text }) => (
                <li key={title} className="list-row px-0">
                  <span className="badge badge-primary badge-soft badge-xl"><Icon size={20} /></span>
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-base-content/70">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>
    </section>
  );
}
