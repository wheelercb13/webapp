"use client";

import { useActionState, useEffect, useRef } from "react";
import { captureInboxItem } from "./actions";

export function CaptureForm() {
  const [state, formAction, pending] = useActionState(captureInboxItem, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex items-end gap-3">
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor="raw_text" className="text-sm text-zinc-600 dark:text-zinc-400">
          Capture
        </label>
        <input
          id="raw_text"
          name="raw_text"
          required
          placeholder="Type anything..."
          className="rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
      >
        {pending ? "Saving…" : "Capture"}
      </button>
      {state?.error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
