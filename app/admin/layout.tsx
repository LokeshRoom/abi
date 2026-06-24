import { ReactNode } from "react";
import { getServerSession, authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-outfit flex flex-col md:flex-row">
      <AdminSidebar email={session.user.email || ""} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-h-screen pt-16 md:pt-0">
        {children}
      </main>
    </div>
  );
}
