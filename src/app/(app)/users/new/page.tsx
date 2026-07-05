import { createUser } from "../actions";
import { UserForm } from "../user-form";

export default function NewUserPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-50">
        Create User
      </h1>
      <div className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <UserForm action={createUser} passwordRequired submitLabel="Create User" />
      </div>
    </div>
  );
}
