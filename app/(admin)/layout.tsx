import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Camera, LayoutDashboard, Users, LogOut, Settings } from "lucide-react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-outfit flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-[var(--border)]">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[var(--accent)]">Abi</span>
            <span className="font-technical text-xs text-[var(--text-muted)] tracking-widest mt-1">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--bg-card)] transition-colors">
            <LayoutDashboard size={20} className="text-[var(--text-secondary)]" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/admin/galleries" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--bg-card)] transition-colors">
            <Camera size={20} className="text-[var(--text-secondary)]" />
            <span className="font-medium">Galleries</span>
          </Link>
          <Link href="/admin/clients" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--bg-card)] transition-colors">
            <Users size={20} className="text-[var(--text-secondary)]" />
            <span className="font-medium">Clients</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-[var(--bg-card)] transition-colors">
            <Settings size={20} className="text-[var(--text-secondary)]" />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 px-4 py-3 text-[var(--text-secondary)]">
            <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center">
              A
            </div>
            <div className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">
              {session.user.email}
            </div>
          </div>
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 mt-2 rounded-lg hover:bg-red-950/30 hover:text-red-500 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
