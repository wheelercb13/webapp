"use client";

import { useActionState, useId } from "react";
import type { Note } from "@/lib/types";
import type { NoteFormState } from "./actions";

export function NoteForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: NoteFormState, formData: FormData) => Promise<NoteFormState>;
  initial?: Pick<Note, "content" | "tags">;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId();

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-content`} className="text-[12px] text-muted">
          Content
        </label>
        <textarea
          id={`${id}-content`}
          name="content"
          required
          rows={6}
          defaultValue={initial?.content}
          className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] leading-[1.5] text-foreground outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-tags`} className="text-[12px] text-muted">
          Tags (comma-separated)
        </label>
        <input
          id={`${id}-tags`}
          name="tags"
          defaultValue={initial?.tags?.join(", ")}
          className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
      {state?.error && <p className="text-[13px] text-delete-text">{state.error}</p>}
    </form>
  );
}
