import { createNote } from "../actions";
import { NoteForm } from "../note-form";

export default function NewNotePage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Create Note
      </h1>
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <NoteForm action={createNote} submitLabel="Add Note" />
      </div>
    </div>
  );
}
