import { createIdea } from "../actions";
import { IdeaForm } from "../idea-form";

export default function NewIdeaPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Create Idea
      </h1>
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <IdeaForm action={createIdea} submitLabel="Add Idea" />
      </div>
    </div>
  );
}
