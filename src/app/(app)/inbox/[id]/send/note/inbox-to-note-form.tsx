"use client";

import { useActionState, useId } from "react";
import type { InboxConvertFormState } from "../../../actions";

export function InboxToNoteForm({
  action,
  rawText,
}: {
  action: (state: InboxConvertFormState, formData: FormData) => Promise<InboxConvertFormState>;
  rawText: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId();

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-content`} className="text-[12px] text-muted">
          Content
        </label>
        <textarea
          id={`${id}-content`}
          name="content"
          required
          rows={6}
          defaultValue={rawText}
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
          className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Add Note"}
      </button>
      {state?.error && <p className="text-[13px] text-delete-text">{state.error}</p>}
    </form>
  );
}
