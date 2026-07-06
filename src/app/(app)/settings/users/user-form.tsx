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
        <label htmlFor={`${id}-name`} className="text-[12px] text-muted">
          Name
        </label>
        <input
          id={`${id}-name`}
          name="name"
          required
          defaultValue={initialName}
          className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-email`} className="text-[12px] text-muted">
          Email
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          defaultValue={initialEmail}
          className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
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
        <label className="flex items-center gap-2 text-[13px] text-foreground">
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
        className="self-start rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
      {state?.error && <p className="text-[13px] text-delete-text">{state.error}</p>}
    </form>
  );
}
