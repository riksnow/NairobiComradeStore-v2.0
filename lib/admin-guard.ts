import { auth } from "@/auth";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getSessionUser();
  return user; // null when signed out
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || user.role !== "Admin") return null;
  return user;
}
