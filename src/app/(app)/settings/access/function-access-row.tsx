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
    <tr className="border-b border-hairline last:border-b-0">
      <td className="px-4 py-3 text-[15px] text-foreground">{label}</td>
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
