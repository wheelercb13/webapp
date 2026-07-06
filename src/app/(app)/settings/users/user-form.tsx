"use client";

import { useActionState, useId } from "react";
import { PasswordInput } from "@/components/password-input";
import type { UserFormState } from "./actions";

export function UserForm({
  action,
  initialEmail,
  initialName,
  initialIsAdmin,
  canManageAdmin,
  passwordRequired,
  submitLabel,
}: {
  action: (state: UserFormState, formData: FormData) => Promise<UserFormState>;
  initialEmail?: string;
  initialName?: string;
  initialIsAdmin?: boolean;
  canManageAdmin?: boolean;
  passwordRequired: boolean;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId();

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-name`} className="text-sm text-zinc-600 dark:text-zinc-400">
          Name
        </label>
        <input
          id={`${id}-name`}
          name="name"
          required
          defaultValue={initialName}
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        />
      </div>
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
      <PasswordInput
        id={`${id}-password`}
        name="password"
        label={passwordRequired ? "Password" : "New password"}
        required={passwordRequired}
        placeholder={passwordRequired ? undefined : "Leave blank to keep current password"}
      />
      <PasswordInput
        id={`${id}-confirm-password`}
        name="confirmPassword"
        label="Confirm password"
        required={passwordRequired}
        placeholder={passwordRequired ? undefined : "Leave blank to keep current password"}
      />
      {canManageAdmin && (
        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            name="isAdmin"
            defaultChecked={initialIsAdmin}
            className="h-4 w-4"
          />
          Admin access
        </label>
      )}
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
