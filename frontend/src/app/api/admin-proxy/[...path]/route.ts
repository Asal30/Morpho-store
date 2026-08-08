import type { NextRequest } from "next/server";

import { apiUrl } from "@/lib/admin-api";

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = new URL(apiUrl(`/api/admin/${path.join("/")}`));
  target.search = request.nextUrl.search;
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const csrf = request.headers.get("x-csrf-token");
  const cookie = request.headers.get("cookie");
  if (contentType) headers.set("content-type", contentType);
  if (csrf) headers.set("x-csrf-token", csrf);
  if (cookie) headers.set("cookie", cookie);
  headers.set("origin", request.nextUrl.origin);

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer(),
    cache: "no-store",
  });
  const responseHeaders = new Headers();
  const responseType = upstream.headers.get("content-type");
  if (responseType) responseHeaders.set("content-type", responseType);
  for (const value of upstream.headers.getSetCookie()) responseHeaders.append("set-cookie", value);
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
