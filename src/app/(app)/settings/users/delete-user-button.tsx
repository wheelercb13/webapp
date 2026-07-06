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
        className="rounded-full border border-red-600/30 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600/10 disabled:opacity-50 dark:text-red-400"
      >
        {pending ? "Deleting…" : "Delete user"}
      </button>
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
