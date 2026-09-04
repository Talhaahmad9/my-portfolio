import { auth } from "@/lib/auth";

export interface AdminUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface AdminSession {
  user: AdminUser;
}

/**
 * Shared admin authorization helper for canonical Server Actions.
 * Wraps existing NextAuth session gate.
 * Throws error if user session is not authenticated.
 */
export async function requireAdmin(): Promise<{ session: AdminSession; user: AdminUser }> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized: Admin session required.");
  }

  return {
    session: session as AdminSession,
    user: session.user as AdminUser,
  };
}
