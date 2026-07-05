import { createTask } from "@/app/(app)/tasks/actions";
import { TaskForm } from "@/app/(app)/tasks/task-form";

export default async function NewTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: domainId } = await params;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Create Task
      </h1>
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <TaskForm action={createTask.bind(null, domainId)} submitLabel="Add Task" />
      </div>
    </div>
  );
}
