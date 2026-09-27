import { Loader, LogIn, X } from "lucide-react";
import { useRef } from "react";
import { useLogin } from "../API/useAuthQueries";
import { openAuthDialog } from "../Utils/authDialogs";

export default function SignInModals() {
  const modalRef = useRef<HTMLDialogElement>(null);
  const loginMutation = useLogin();

  async function handleSignIn(formData: FormData) {
    try {
      await loginMutation.mutateAsync({
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });
    } catch (error) {
      // The mutation displays the error toast; handle the rejected form action here.
      console.log(error);
    }
  }

  function showSignUp() {
    modalRef.current?.close();
    openAuthDialog("sign-up-modal");
  }

  return (
    <dialog ref={modalRef} id="sign-in-modal" className="modal backdrop-blur-sm">
      <div className="modal-box max-w-md bg-base-200 border border-slate-700">
        <X
          onClick={() => modalRef.current?.close()}
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 cursor-pointer"
        />
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="mt-2 text-sm text-base-content/70">Sign in to your DutyPlanner account.</p>
        <form action={handleSignIn} className="space-y-5 py-6">
          <label className="floating-label">
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="input w-full"
              required
            />
          </label>
          <label className="floating-label">
            <span>Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Your password"
              className="input w-full"
              required
            />
          </label>
          <button className="btn btn-primary btn-block" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? <Loader className="animate-spin" /> : <LogIn className="h-4 w-4" />}Sign In
          </button>
        </form>
        <p className="text-center text-sm text-base-content/60">
          Don&apos;t have an account?{" "}
          <span
            onClick={showSignUp}
            className="text-info hover:underline hover:font-bold cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </div>
    </dialog>
  );
}
