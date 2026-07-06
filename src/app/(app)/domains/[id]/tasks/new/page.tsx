import { createTask } from "@/app/(app)/tasks/actions";
import { TaskForm } from "@/app/(app)/tasks/task-form";

export default async function NewTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: domainId } = await params;

  return (
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Create Task
        </h1>
      </div>
      <div className="rounded-xl border border-card-border p-4">
        <TaskForm action={createTask.bind(null, domainId)} submitLabel="Add Task" />
      </div>
    </div>
  );
}
