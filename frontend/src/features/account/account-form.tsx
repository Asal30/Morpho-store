"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest, setAuthToken } from "@/lib/api-client";

interface AuthResponse {
  token: string;
  user: { firstName: string; email: string };
}

export function AccountForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (mode === "register") {
        await apiRequest("/api/users/register", { method: "POST", body: JSON.stringify(fields) });
      }
      const auth = await apiRequest<AuthResponse>("/api/users/login", {
        method: "POST",
        body: JSON.stringify({ email: fields.email, password: fields.password }),
      });
      setAuthToken(auth.token);
      const redirect = new URLSearchParams(window.location.search).get("redirect") ?? "/account";
      window.location.assign(redirect);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to continue");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl bg-surface p-6 sm:p-10">
      <div className="grid grid-cols-2 gap-2">
        <Button variant={mode === "login" ? "primary" : "outline"} onClick={() => setMode("login")}>Sign in</Button>
        <Button variant={mode === "register" ? "primary" : "outline"} onClick={() => setMode("register")}>Create account</Button>
      </div>
      <form className="mt-8 space-y-4" onSubmit={submit}>
        {mode === "register" ? <><Input name="firstName" required placeholder="First name" aria-label="First name" /><Input name="lastName" required placeholder="Last name" aria-label="Last name" /><Input name="phone" required placeholder="Phone" aria-label="Phone" /><Input name="whatsApp" required placeholder="WhatsApp" aria-label="WhatsApp" /></> : null}
        <Input name="email" type="email" required placeholder="Email" aria-label="Email" />
        <Input name="password" type="password" required minLength={8} placeholder="Password" aria-label="Password" />
        {message ? <p role="alert" className="text-sm text-destructive">{message}</p> : null}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</Button>
      </form>
    </section>
  );
}
