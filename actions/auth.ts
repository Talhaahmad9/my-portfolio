"use server";

import { signIn, signOut } from "@/lib/auth";
import { loginSchema } from "@/lib/validate";
import { AuthError } from "next-auth";

export async function loginAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirect: false });
}
