"use client";

import { useActionState } from "react";
import { deleteUser } from "./actions";

export function DeleteUserButton({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(
    deleteUser.bind(null, userId),
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full border border-delete-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-delete-text transition-colors hover:bg-white/[.06] disabled:opacity-50"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {state?.error && <p className="text-[13px] text-delete-text">{state.error}</p>}
    </form>
  );
}
