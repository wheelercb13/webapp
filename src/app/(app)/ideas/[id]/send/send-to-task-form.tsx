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
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        You need at least one domain before sending an idea to a task.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor={`${id}-domainId`} className="text-sm text-zinc-600 dark:text-zinc-400">
          Domain
        </label>
        <select
          id={`${id}-domainId`}
          name="domainId"
          defaultValue={domains[0].id}
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
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
        className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {pending ? "Creating…" : "Create Task"}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
