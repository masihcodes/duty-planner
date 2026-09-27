import { errorMessage } from "../API/client";

interface QueryFeedbackProps {
  error?: unknown;
  retry?: () => void;
}

export default function QueryFeedback({ error, retry }: QueryFeedbackProps) {
  if (error) {
    return (
      <div className="alert alert-error" role="alert">
        <span>{errorMessage(error)}</span>
        {retry && (
          <button className="btn btn-sm" onClick={retry}>Try again</button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 p-10" role="status">
      <span className="loading loading-spinner loading-sm" />Loading plan…
    </div>
  );
}
