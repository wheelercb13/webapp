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
      <label htmlFor={id} className="text-sm text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          required={required}
          placeholder={placeholder}
          className="flex-1 rounded border border-black/10 bg-transparent px-3 py-2 text-black dark:border-white/10 dark:text-zinc-50"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="rounded-full border border-black/10 px-3 py-2 text-xs font-medium text-black hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}
