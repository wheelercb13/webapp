import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Domain, Task } from "@/lib/types";
import { updateDomain, deleteDomain } from "../actions";
import { DomainForm } from "../domain-form";
import { createTask } from "@/app/(app)/tasks/actions";
import { TaskForm } from "@/app/(app)/tasks/task-form";
import { TaskRow } from "@/app/(app)/tasks/task-row";

export default async function DomainDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: domain } = (await supabase
    .from("domains")
    .select("*")
    .eq("id", id)
    .single()) as { data: Domain | null };

  if (!domain) {
    notFound();
  }

  const { data: tasksData } = (await supabase
    .from("tasks")
    .select("*")
    .eq("domain_id", id)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true })) as { data: Task[] | null };

  const tasks = tasksData ?? [];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h1 className="mb-3 text-xl font-semibold text-black dark:text-zinc-50">
          Edit domain
        </h1>
        <DomainForm
          action={updateDomain.bind(null, domain.id)}
          initial={domain}
          submitLabel="Save"
        />
        <form action={deleteDomain.bind(null, domain.id)} className="mt-3">
          <button
            type="submit"
            className="rounded-full border border-red-600/30 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600/10 dark:text-red-400"
          >
            Delete domain
          </button>
        </form>
      </div>

      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <h2 className="mb-3 text-lg font-semibold text-black dark:text-zinc-50">
          Add task
        </h2>
        <TaskForm action={createTask.bind(null, domain.id)} submitLabel="Add task" />
      </div>

      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No tasks in this domain yet.
          </p>
        )}
      </ul>
    </div>
  );
}
