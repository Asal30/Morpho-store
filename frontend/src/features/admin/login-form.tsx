"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); setError(""); const data = new FormData(event.currentTarget); const response = await fetch("/api/admin-proxy/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username: data.get("username"), password: data.get("password") }) }); setPending(false); if (!response.ok) { const body = await response.json().catch(() => ({ detail: "Unable to sign in" })); setError(body.detail ?? "Unable to sign in"); return; } router.replace("/admin"); router.refresh(); }
  return <form onSubmit={submit} className="mt-8 grid gap-5"><label className="grid gap-2 text-xs font-semibold tracking-[0.12em] uppercase">Username<Input name="username" autoComplete="username" required /></label><label className="grid gap-2 text-xs font-semibold tracking-[0.12em] uppercase">Password<Input name="password" type="password" autoComplete="current-password" required /></label>{error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}<Button type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</Button></form>;
}
