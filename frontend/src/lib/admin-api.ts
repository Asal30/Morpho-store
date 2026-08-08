export function apiUrl(path: string): string {
  const base = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("Admin API is not configured");
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function adminServerFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieStore = await cookies();
  return fetch(apiUrl(`/api/admin${path}`), {
    ...init,
    cache: "no-store",
    headers: { ...init?.headers, cookie: cookieStore.toString() },
  });
}

export async function requireAdminSession(): Promise<{ username: string; expiresAt: string } | null> {
  const response = await adminServerFetch("/auth/session");
  return response.ok ? response.json() : null;
}
import { cookies } from "next/headers";
