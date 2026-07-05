"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserFormState = { error?: string } | undefined;

export async function createUser(
  _state: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/users");
  redirect("/users");
}

export async function updateUser(
  userId: string,
  _state: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const email = (formData.get("email") as string)?.trim();
  const password = (formData.get("password") as string) || undefined;

  if (!email) {
    return { error: "Email is required." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    email,
    ...(password ? { password } : {}),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/users");
  redirect("/users");
}

export async function deleteUser(userId: string): Promise<UserFormState> {
  const admin = createAdminClient();

  const { data: usersData, error: listError } = await admin.auth.admin.listUsers();
  if (listError) {
    return { error: listError.message };
  }
  if ((usersData?.users?.length ?? 0) <= 1) {
    return { error: "Can't delete the last remaining user." };
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/users");
  redirect("/users");
}
