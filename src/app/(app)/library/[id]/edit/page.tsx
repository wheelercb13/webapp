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
    <div className="mx-auto flex w-full max-w-[468px] flex-col px-[22px]">
      <div className="pb-[26px] pt-9">
        <h1 className="font-serif text-[34px] font-medium leading-[1.02] tracking-[-0.01em] text-foreground-display">
          Edit Note
        </h1>
      </div>
      <div className="mb-4 rounded-xl border border-card-border p-4">
        <NoteForm action={updateNote.bind(null, note.id)} initial={note} submitLabel="Save" />
      </div>
      <form action={deleteNote.bind(null, note.id)}>
        <button
          type="submit"
          className="rounded-full border border-delete-border px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-delete-text transition-colors hover:bg-white/[.06]"
        >
          Delete note
        </button>
      </form>
    </div>
  );
}
