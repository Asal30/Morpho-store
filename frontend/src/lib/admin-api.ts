export function backendUrl(path: string): string {
  const base = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function adminServerFetch(path: string, init?: RequestInit): Promise<Response> {
  const cookieStore = await cookies();
  return fetch(backendUrl(`/api/admin${path}`), {
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
