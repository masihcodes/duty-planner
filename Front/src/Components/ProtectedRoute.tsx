import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../API/useAuthQueries";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data: user, isPending, isError, refetch } = useCurrentUser();

  if (isPending) return <div className="p-6">Verifying access...</div>;

  if (isError) {
    return (
      <div className="alert alert-error">
        <span>Unable to verify access.</span>
        <button className="btn btn-sm" onClick={() => refetch()}>
          Try again
        </button>
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return children;
}
