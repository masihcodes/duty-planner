import { Loader, UserPlus, X } from "lucide-react";
import { useRef } from "react";
import { useRegister } from "../API/useAuthQueries";
import { openAuthDialog } from "../Utils/authDialogs";

export default function SignUpModal() {
  const modalRef = useRef<HTMLDialogElement>(null);
  const registerMutation = useRegister();

  async function handleSignUp(formData: FormData) {
    try {
      await registerMutation.mutateAsync({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      });
    } catch (error) {
      // The mutation displays the error toast; handle the rejected form action here.
      console.log(error);
    }
  }

  function showSignIn() {
    modalRef.current?.close();
    openAuthDialog("sign-in-modal");
  }

  return (
    <dialog ref={modalRef} id="sign-up-modal" className="modal backdrop-blur-sm">
      <div className="modal-box max-w-md bg-base-200 border border-slate-700">
        <X
          onClick={() => modalRef.current?.close()}
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 cursor-pointer"
        />
        <h2 className="text-2xl font-bold">Create your account</h2>
        <p className="mt-2 text-sm text-base-content/70">Start planning your duties with your team.</p>
        <form action={handleSignUp} className="space-y-5 py-6">
          <label className="floating-label">
            <span>Name</span>
            <input
              type="text"
              name="name"
              autoComplete="name"
              placeholder="Your name"
              className="input w-full"
              required
            />
          </label>
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
              autoComplete="new-password"
              placeholder="Choose a password"
              className="input w-full"
              required
            />
          </label>
          <button disabled={registerMutation.isPending} className="btn btn-primary btn-block">
            {registerMutation.isPending ? <Loader className="animate-spin" /> : <UserPlus className="h-4 w-4" />} Create account
          </button>
        </form>
        <p className="text-center text-sm text-base-content/60">
          Already have an account?{" "}
          <span
            className="text-info hover:underline hover:font-bold cursor-pointer"
            onClick={showSignIn}
          >
            Sign In
          </span>
        </p>
      </div>
    </dialog>
  );
}
