const DEFAULT_API_URL = "http://localhost:4200";

export const AUTH_TOKEN_KEY = "morpho_auth_token";

export function apiUrl(path: string): string {
  return `${(process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "")}${path}`;
}

export function getAuthToken(): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { "content-type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = (await response.json().catch(() => null)) as
    | { success: true; data: T }
    | { success: false; message: string }
    | null;
  if (!response.ok || !body?.success) {
    throw new Error(body && "message" in body ? body.message : "The MORPHO service is unavailable");
  }
  return body.data;
}
