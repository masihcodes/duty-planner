import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../API/useAuthQueries";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { data: user } = useCurrentUser();

  if (user?.role !== "admin") {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 p-8">
        <div className="alert alert-error">Administrator access is required.</div>
        <Link to="/plans" className="btn mt-4">Back to plans</Link>
      </main>
    );
  }

  return children;
}
