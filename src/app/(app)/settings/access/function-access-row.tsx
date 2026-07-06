"use client";

import { useTransition } from "react";
import { updateFunctionAccess } from "./actions";
import type { FunctionAccessLevel } from "@/lib/types";

export function FunctionAccessRow({
  funcKey,
  label,
  accessLevel,
}: {
  funcKey: string;
  label: string;
  accessLevel: FunctionAccessLevel;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(next: FunctionAccessLevel) {
    startTransition(() => {
      updateFunctionAccess(funcKey, next);
    });
  }

  return (
    <tr>
      <td className="px-4 py-3 text-black dark:text-zinc-50">{label}</td>
      <td className="px-4 py-3 text-center">
        <input
          type="checkbox"
          checked={accessLevel === "general"}
          disabled={isPending}
          onChange={() => handleChange("general")}
          className="h-4 w-4"
        />
      </td>
      <td className="px-4 py-3 text-center">
        <input
          type="checkbox"
          checked={accessLevel === "admin"}
          disabled={isPending}
          onChange={() => handleChange("admin")}
          className="h-4 w-4"
        />
      </td>
    </tr>
  );
}
