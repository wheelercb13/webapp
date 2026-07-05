"use client";

import { useActionState, useId } from "react";
import type { UserFormState } from "./actions";

export function UserForm({
  action,
  initialEmail,
  passwordRequired,
  submitLabel,
}: {
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
  initialEmail?: string;
  passwordRequired: boolean;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId();

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-email`} className="text-sm text-zinc-600 dark:text-zinc-400">
          Email
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          defaultValue={initialEmail}
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-password`} className="text-sm text-zinc-600 dark:text-zinc-400">
          {passwordRequired ? "Password" : "New password"}
        </label>
        <input
          id={`${id}-password`}
          name="password"
          type="password"
          required={passwordRequired}
          placeholder={passwordRequired ? undefined : "Leave blank to keep current password"}
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
