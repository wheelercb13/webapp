import { redirect } from "next/navigation";
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
    redirect(`/domains/${domainId}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Edit Task
        </h1>
      </div>
      <div className="rounded-xl border border-card-border p-4">
        <TaskForm
          action={updateTask.bind(null, domainId, taskId)}
          initial={task}
          submitLabel="Save"
        />
      </div>
    </div>
  );
}
