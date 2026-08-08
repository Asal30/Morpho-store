import { redirect } from "next/navigation";

import { AdminShell } from "@/features/admin/admin-shell";
import { requireAdminSession } from "@/lib/admin-api";

export default async function ProtectedAdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireAdminSession();
  if (!session) redirect("/admin/login");
  return <AdminShell>{children}</AdminShell>;
}
