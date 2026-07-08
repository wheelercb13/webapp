"use client";

import { useActionState, useId } from "react";
import type { Domain } from "@/lib/types";
import type { InboxConvertFormState } from "../../../actions";

export function InboxToTaskForm({
  action,
  rawText,
  domains,
}: {
  action: (state: InboxConvertFormState, formData: FormData) => Promise<InboxConvertFormState>;
  rawText: string;
  domains: Domain[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId();

  if (domains.length === 0) {
    return (
      <p className="text-[14px] text-muted">
        You need at least one domain before converting an inbox item to a task.
      </p>
    );
  }

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
        <label htmlFor={`${id}-domainId`} className="text-[12px] text-muted">
          Domain
        </label>
        <select
          id={`${id}-domainId`}
          name="domainId"
          defaultValue={domains[0].id}
          className="rounded-lg border border-card-border bg-background px-3 py-2.5 text-[15px] text-foreground outline-none"
        >
          {domains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-due_date`} className="text-[12px] text-muted">
          Due date
        </label>
        <input
          id={`${id}-due_date`}
          name="due_date"
          type="date"
          className="rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
        />
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
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create Task"}
      </button>
      {state?.error && <p className="w-full text-[13px] text-delete-text">{state.error}</p>}
    </form>
  );
}
