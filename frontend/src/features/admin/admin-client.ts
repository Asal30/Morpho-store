export function csrfToken(): string {
  const value = document.cookie.split("; ").find((item) => item.startsWith("morpho_admin_csrf="))?.split("=")[1];
  return value ? decodeURIComponent(value) : "";
}

export async function adminMutation(path: string, init: RequestInit): Promise<Response> {
  return fetch(`/api/admin-proxy${path}`, { ...init, headers: { ...init.headers, "x-csrf-token": csrfToken() } });
}
