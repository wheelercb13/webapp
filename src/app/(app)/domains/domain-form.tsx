"use client";

import { useActionState, useId } from "react";
import { DOMAIN_COLORS, type Domain } from "@/lib/types";
import type { DomainFormState } from "./actions";

export function DomainForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: DomainFormState, formData: FormData) => Promise<DomainFormState>;
  initial?: Pick<Domain, "name" | "color">;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId();

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-name`} className="text-[12px] text-muted">
          Name
        </label>
        <input
          id={`${id}-name`}
          name="name"
          required
          defaultValue={initial?.name}
          className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-color`} className="text-[12px] text-muted">
          Color
        </label>
        <select
          id={`${id}-color`}
          name="color"
          defaultValue={initial?.color ?? DOMAIN_COLORS[0]}
          className="rounded-lg border border-card-border bg-background px-3 py-2.5 text-[15px] text-foreground outline-none"
        >
          {DOMAIN_COLORS.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
      {state?.error && <p className="w-full text-[13px] text-delete-text">{state.error}</p>}
    </form>
  );
}
