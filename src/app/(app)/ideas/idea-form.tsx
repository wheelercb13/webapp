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
          <label htmlFor={`${id}-title`} className="text-[12px] text-muted">
            Title
          </label>
          <input
            id={`${id}-title`}
            name="title"
            required
            defaultValue={initial?.title}
            className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
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
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={`${id}-stage`} className="text-[12px] text-muted">
            Stage
          </label>
          <select
            id={`${id}-stage`}
            name="stage"
            defaultValue={initial?.stage ?? "idea"}
            className="rounded-lg border border-card-border bg-background px-3 py-2.5 text-[15px] text-foreground outline-none"
          >
            <option value="idea">idea</option>
            <option value="drafting">drafting</option>
            <option value="published">published</option>
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor={`${id}-priority`} className="text-[12px] text-muted">
            Priority
          </label>
          <select
            id={`${id}-priority`}
            name="priority"
            defaultValue={initial?.priority ?? "med"}
            className="rounded-lg border border-card-border bg-background px-3 py-2.5 text-[15px] text-foreground outline-none"
          >
            <option value="low">low</option>
            <option value="med">med</option>
            <option value="high">high</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-notes`} className="text-[12px] text-muted">
          Notes
        </label>
        <textarea
          ref={notesRef}
          id={`${id}-notes`}
          name="notes"
          rows={1}
          defaultValue={initial?.notes ?? undefined}
          onInput={(e) => autoGrow(e.currentTarget)}
          className="resize-none overflow-hidden rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
        />
      </div>

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
