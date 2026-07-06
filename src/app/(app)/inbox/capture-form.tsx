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
    <form ref={formRef} action={formAction} className="flex w-full flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <label htmlFor="raw_text" className="sr-only">
          Capture a thought
        </label>
        <input
          id="raw_text"
          name="raw_text"
          required
          placeholder="Capture a thought…"
          className="flex-1 bg-transparent text-[15px] text-foreground outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full bg-accent px-4 py-2 text-[12px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Capture"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
    </form>
  );
}
