"use client";

import { useActionState } from "react";
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

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm text-zinc-600 dark:text-zinc-400">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={initial?.name}
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="color" className="text-sm text-zinc-600 dark:text-zinc-400">
          Color
        </label>
        <select
          id="color"
          name="color"
          defaultValue={initial?.color ?? DOMAIN_COLORS[0]}
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
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
        className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
