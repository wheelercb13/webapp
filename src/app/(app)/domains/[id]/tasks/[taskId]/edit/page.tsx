import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/lib/types";
import { updateTask } from "@/app/(app)/tasks/actions";
import { TaskForm } from "@/app/(app)/tasks/task-form";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id: domainId, taskId } = await params;
  const supabase = await createClient();

  const { data: task } = (await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("domain_id", domainId)
    .single()) as { data: Task | null };

  if (!task) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Edit Task
      </h1>
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <TaskForm
          action={updateTask.bind(null, domainId, taskId)}
          initial={task}
          submitLabel="Save"
        />
      </div>
    </div>
  );
}
