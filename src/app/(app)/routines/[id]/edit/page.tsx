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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Edit Routine
      </h1>
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <RoutineForm
          action={updateRoutine.bind(null, routine.id)}
          initial={routine}
          submitLabel="Save"
        />
      </div>
      <form action={deleteRoutine.bind(null, routine.id)}>
        <button
          type="submit"
          className="rounded-full border border-red-600/30 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600/10 dark:text-red-400"
        >
          Delete routine
        </button>
      </form>
    </div>
  );
}
