import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Domain, Task } from "@/lib/types";
import { DOMAIN_COLOR_CLASSES } from "@/lib/colors";
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
    redirect("/domains");
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
      <div className="flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-3 text-xl font-semibold text-black dark:text-zinc-50">
          <span
            className={`h-3 w-3 shrink-0 rounded-full ${DOMAIN_COLOR_CLASSES[domain.color]}`}
          />
          {domain.name}
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/domains/${domain.id}/edit`}
            className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-black hover:bg-black/[.04] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/[.06]"
          >
            Edit
          </Link>
          <Link
            href={`/domains/${domain.id}/tasks/new`}
            className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Create New Task
          </Link>
        </div>
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
