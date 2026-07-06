"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import type { Idea } from "@/lib/types";
import type { IdeaFormState } from "./actions";

function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export function IdeaForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: IdeaFormState, formData: FormData) => Promise<IdeaFormState>;
  initial?: Pick<Idea, "title" | "notes" | "tags" | "stage" | "priority">;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId();
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (notesRef.current) autoGrow(notesRef.current);
  }, []);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={`${id}-title`} className="text-sm text-zinc-600 dark:text-zinc-400">
            Title
          </label>
          <input
            id={`${id}-title`}
            name="title"
            required
            defaultValue={initial?.title}
            className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
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
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={`${id}-stage`} className="text-sm text-zinc-600 dark:text-zinc-400">
            Stage
          </label>
          <select
            id={`${id}-stage`}
            name="stage"
            defaultValue={initial?.stage ?? "idea"}
            className="rounded border border-black/10 bg-white px-3 py-2 text-black dark:border-white/10 dark:bg-black dark:text-zinc-50"
          >
            <option value="idea">idea</option>
            <option value="drafting">drafting</option>
            <option value="published">published</option>
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={`${id}-priority`} className="text-sm text-zinc-600 dark:text-zinc-400">
            Priority
          </label>
          <select
            id={`${id}-priority`}
            name="priority"
            defaultValue={initial?.priority ?? "med"}
            className="rounded border border-black/10 bg-white px-3 py-2 text-black dark:border-white/10 dark:bg-black dark:text-zinc-50"
          >
            <option value="low">low</option>
            <option value="med">med</option>
            <option value="high">high</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-notes`} className="text-sm text-zinc-600 dark:text-zinc-400">
          Notes
        </label>
        <textarea
          ref={notesRef}
          id={`${id}-notes`}
          name="notes"
          rows={1}
          defaultValue={initial?.notes ?? undefined}
          onInput={(e) => autoGrow(e.currentTarget)}
          className="resize-none overflow-hidden rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
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
