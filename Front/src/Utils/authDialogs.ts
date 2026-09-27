type AuthDialogId = "sign-in-modal" | "sign-up-modal";

export function openAuthDialog(id: AuthDialogId) {
  (document.getElementById(id) as HTMLDialogElement)?.showModal();
}

export function closeAuthDialogs() {
  (document.getElementById("sign-up-modal") as HTMLDialogElement)?.close();
  (document.getElementById("sign-in-modal") as HTMLDialogElement)?.close();
}
