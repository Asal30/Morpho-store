import { redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin-api";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await requireAdminSession())) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
