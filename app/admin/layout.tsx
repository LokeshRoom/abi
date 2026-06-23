import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession, authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Camera, LayoutDashboard, Users, LogOut, Settings, Calendar, MessageSquare, Star, Newspaper } from "lucide-react";
import NotificationBell from "@/components/layout/notification-bell";

export const dynamic = "force-dynamic";

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

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-4 py-2 text-[10px] font-technical tracking-widest text-[var(--text-muted)]">CORE</p>
          
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-[var(--bg-card)] hover:text-[var(--accent)] transition-colors">
            <LayoutDashboard size={18} className="text-[var(--text-secondary)]" />
            <span className="font-medium text-sm">Dashboard</span>
          </Link>
          
          <p className="px-4 pt-4 pb-2 text-[10px] font-technical tracking-widest text-[var(--text-muted)]">CONTENT MANAGEMENT</p>

          <Link href="/admin/bookings" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-[var(--bg-card)] hover:text-[var(--accent)] transition-colors">
            <Calendar size={18} className="text-[var(--text-secondary)]" />
            <span className="font-medium text-sm">Bookings</span>
          </Link>

          <Link href="/admin/contacts" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-[var(--bg-card)] hover:text-[var(--accent)] transition-colors">
            <MessageSquare size={18} className="text-[var(--text-secondary)]" />
            <span className="font-medium text-sm">Contacts</span>
          </Link>

          <Link href="/admin/reviews" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-[var(--bg-card)] hover:text-[var(--accent)] transition-colors">
            <Star size={18} className="text-[var(--text-secondary)]" />
            <span className="font-medium text-sm">Reviews</span>
          </Link>

          <Link href="/admin/blogs" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-[var(--bg-card)] hover:text-[var(--accent)] transition-colors">
            <Newspaper size={18} className="text-[var(--text-secondary)]" />
            <span className="font-medium text-sm">Blogs</span>
          </Link>

          <p className="px-4 pt-4 pb-2 text-[10px] font-technical tracking-widest text-[var(--text-muted)]">SYSTEM</p>

          <Link href="/admin/galleries" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-[var(--bg-card)] hover:text-[var(--accent)] transition-colors">
            <Camera size={18} className="text-[var(--text-secondary)]" />
            <span className="font-medium text-sm">Galleries</span>
          </Link>
          <Link href="/admin/clients" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-[var(--bg-card)] hover:text-[var(--accent)] transition-colors">
            <Users size={18} className="text-[var(--text-secondary)]" />
            <span className="font-medium text-sm">Clients</span>
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-[var(--bg-card)] hover:text-[var(--accent)] transition-colors">
            <Settings size={18} className="text-[var(--text-secondary)]" />
            <span className="font-medium text-sm">Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-primary)]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] min-w-0">
              <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center font-technical text-xs border border-[var(--text-muted)] text-[var(--text-primary)] shrink-0">
                A
              </div>
              <div className="text-xs overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                {session.user.email}
              </div>
            </div>
            <NotificationBell />
          </div>
          <form action="/api/auth/signout" method="POST" className="w-full">
            <button type="submit" className="flex items-center gap-3 px-4 py-2 mt-2 w-full text-left rounded-lg hover:bg-red-950/30 hover:text-red-500 transition-colors text-xs cursor-pointer">
              <LogOut size={16} />
              <span className="font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}
