"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserFormState = { error?: string } | undefined;

async function currentUserIsAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { userId: user?.id, isAdmin: !!user?.app_metadata?.is_admin };
}

async function countAdmins(admin: ReturnType<typeof createAdminClient>) {
  const { data } = await admin.auth.admin.listUsers();
  return (data?.users ?? []).filter((u) => !!u.app_metadata?.is_admin).length;
}

export async function createUser(
  _state: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const wantsAdmin = formData.get("isAdmin") === "on";

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match. Try again." };
  }

  const { isAdmin: actingUserIsAdmin } = await currentUserIsAdmin();

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
    app_metadata: { is_admin: actingUserIsAdmin && wantsAdmin },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/users");
  redirect("/users", "replace");
}

export async function updateUser(
  userId: string,
  _state: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string) || undefined;
  const confirmPassword = (formData.get("confirmPassword") as string) || undefined;
  const wantsAdmin = formData.get("isAdmin") === "on";

  if (!name || !email) {
    return { error: "Name and email are required." };
  }
  if (password && password !== confirmPassword) {
    return { error: "Passwords do not match. Try again." };
  }

  const { userId: actingUserId, isAdmin: actingUserIsAdmin } = await currentUserIsAdmin();

  const admin = createAdminClient();

  const updates: Parameters<typeof admin.auth.admin.updateUserById>[1] = {
    email,
    user_metadata: { name },
    ...(password ? { password } : {}),
  };

  if (actingUserIsAdmin) {
    const isSelf = actingUserId === userId;
    if (isSelf && !wantsAdmin) {
      const adminCount = await countAdmins(admin);
      if (adminCount <= 1) {
        return { error: "Can't remove admin access from the last remaining admin." };
      }
    }
    updates.app_metadata = { is_admin: wantsAdmin };
  }

  const { error } = await admin.auth.admin.updateUserById(userId, updates);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/users");
  redirect("/users", "replace");
}

export async function deleteUser(userId: string): Promise<UserFormState> {
  const admin = createAdminClient();

  const { data: usersData, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    return { error: listError.message };
  }

  const users = usersData?.users ?? [];
  if (users.length <= 1) {
    return { error: "Can't delete the last remaining user." };
  }

  const target = users.find((u) => u.id === userId);
  const admins = users.filter((u) => !!u.app_metadata?.is_admin);
  if (target?.app_metadata?.is_admin && admins.length <= 1) {
    return { error: "Can't delete the last remaining admin." };
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/users");
  redirect("/users", "replace");
}
