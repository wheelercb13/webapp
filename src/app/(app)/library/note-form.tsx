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
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-content`} className="text-sm text-zinc-600 dark:text-zinc-400">
          Content
        </label>
        <textarea
          id={`${id}-content`}
          name="content"
          required
          rows={6}
          defaultValue={initial?.content}
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-tags`} className="text-sm text-zinc-600 dark:text-zinc-400">
          Tags (comma-separated)
        </label>
        <input
          id={`${id}-tags`}
          name="tags"
          defaultValue={initial?.tags?.join(", ")}
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
