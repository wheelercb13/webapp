import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateUser } from "../actions";
import { UserForm } from "../user-form";
import { DeleteUserButton } from "../delete-user-button";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(id);

  if (!data?.user) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  const isCurrentUser = currentUser?.id === id;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        {data.user.user_metadata?.name || data.user.email}
      </h1>
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <UserForm
          action={updateUser.bind(null, id)}
          initialEmail={data.user.email}
          initialName={data.user.user_metadata?.name}
          passwordRequired={false}
          submitLabel="Save"
        />
      </div>
      {!isCurrentUser && <DeleteUserButton userId={id} />}
    </div>
  );
}
