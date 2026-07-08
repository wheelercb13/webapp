"use client";

import { useActionState, useId } from "react";
import type { InboxConvertFormState } from "../../../actions";

export function InboxToIdeaForm({
  action,
  rawText,
}: {
  action: (state: InboxConvertFormState, formData: FormData) => Promise<InboxConvertFormState>;
  rawText: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId();

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-[180px] flex-1 flex-col gap-1">
        <label htmlFor={`${id}-title`} className="text-[12px] text-muted">
          Title
        </label>
        <input
          id={`${id}-title`}
          name="title"
          required
          defaultValue={rawText}
          className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-stage`} className="text-[12px] text-muted">
          Stage
        </label>
        <select
          id={`${id}-stage`}
          name="stage"
          defaultValue="idea"
          className="rounded-lg border border-card-border bg-background px-3 py-2.5 text-[15px] text-foreground outline-none"
        >
          <option value="idea">idea</option>
          <option value="drafting">drafting</option>
          <option value="published">published</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-priority`} className="text-[12px] text-muted">
          Priority
        </label>
        <select
          id={`${id}-priority`}
          name="priority"
          defaultValue="med"
          className="rounded-lg border border-card-border bg-background px-3 py-2.5 text-[15px] text-foreground outline-none"
        >
          <option value="low">low</option>
          <option value="med">med</option>
          <option value="high">high</option>
        </select>
      </div>
      <div className="flex flex-1 min-w-[160px] flex-col gap-1">
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
        className="rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create Idea"}
      </button>
      {state?.error && <p className="w-full text-[13px] text-delete-text">{state.error}</p>}
    </form>
  );
}
