import { redirect } from "next/navigation";
import { LoginForm } from "@/features/admin/login-form";
import { requireAdminSession } from "@/lib/admin-api";

export default async function AdminLoginPage() {
  if (await requireAdminSession()) redirect("/admin");
  return <main data-admin-root className="grid min-h-screen place-items-center bg-primary px-5 py-12"><section className="w-full max-w-md bg-surface p-7 sm:p-10" aria-labelledby="login-title"><p className="text-caption font-semibold tracking-[0.2em] text-highlight uppercase">MORPHO Administration</p><h1 id="login-title" className="mt-3 font-display text-5xl font-medium text-primary">Welcome back.</h1><p className="mt-3 text-sm text-foreground-soft">Sign in with the configured administrator account.</p><LoginForm /></section></main>;
}
