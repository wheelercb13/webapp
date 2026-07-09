import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Routine } from "@/lib/types";
import { updateRoutine, deleteRoutine } from "../../actions";
import { RoutineForm } from "../../routine-form";

export default async function EditRoutinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: routine } = (await supabase
    .from("routines")
    .select("*")
    .eq("id", id)
    .single()) as { data: Routine | null };

  if (!routine) {
    redirect("/routines");
  }

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Edit Routine
        </h1>
      </div>
      <div className="mb-4 rounded-xl border border-card-border p-4">
        <RoutineForm
          action={updateRoutine.bind(null, routine.id)}
          initial={routine}
          submitLabel="Save"
        />
      </div>
      <form action={deleteRoutine.bind(null, routine.id)}>
        <button
          type="submit"
          className="rounded-full border border-delete-border px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-delete-text transition-colors hover:bg-white/[.06]"
        >
          Delete
        </button>
      </form>
    </div>
  );
}
