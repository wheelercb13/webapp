"use client";

import { useState } from "react";

export function PasswordInput({
  id,
  name,
  label,
  required,
  placeholder,
}: {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[12px] text-muted">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          required={required}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-card-border bg-transparent px-3 py-2.5 text-[15px] text-foreground outline-none"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="inline-flex items-center justify-center rounded-full border border-button-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-white/[.06]"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
