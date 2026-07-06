import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Note } from "@/lib/types";
import { updateNote, deleteNote } from "../../actions";
import { NoteForm } from "../../note-form";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: note } = (await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single()) as { data: Note | null };

  if (!note) {
    redirect("/library");
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Edit Note
      </h1>
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <NoteForm
          action={updateNote.bind(null, note.id)}
          initial={note}
          submitLabel="Save"
        />
      </div>
      <form action={deleteNote.bind(null, note.id)}>
        <button
          type="submit"
          className="rounded-full border border-red-600/30 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-600/10 dark:text-red-400"
        >
          Delete note
        </button>
      </form>
    </div>
  );
}
