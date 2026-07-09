"use client";

import { useActionState, useId } from "react";
import type { Domain } from "@/lib/types";
import type { IdeaFormState } from "../../actions";

export function SendToTaskForm({
  action,
  domains,
}: {
  action: (state: IdeaFormState, formData: FormData) => Promise<IdeaFormState>;
  domains: Domain[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const id = useId();

  if (domains.length === 0) {
    return (
      <p className="text-[14px] text-muted">
        You need at least one domain before sending an idea to a task.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${id}-domainId`} className="text-[12px] text-muted">
            Domain
          </label>
          <select
            id={`${id}-domainId`}
            name="domainId"
            defaultValue={domains[0].id}
            className="rounded-full border border-button-border bg-background px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground outline-none transition-colors hover:bg-white/[.06]"
          >
            {domains.map((domain) => (
              <option key={domain.id} value={domain.id}>
                {domain.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-5 py-2.5 text-[12px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create Task"}
        </button>
      </div>
      {state?.error && <p className="text-[13px] text-delete-text">{state.error}</p>}
    </form>
  );
}
