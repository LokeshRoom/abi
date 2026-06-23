import { ReactNode } from "react";
import Link from "next/link";
import { getServerSession, authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import NotificationBell from "@/components/layout/notification-bell";

export const dynamic = "force-dynamic";

export default async function ProofingLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-outfit flex flex-col">
      {/* Client Header */}
      <header className="h-16 border-b border-[var(--border)] flex items-center justify-between px-6 bg-[var(--bg-primary)]/80 backdrop-blur-md sticky top-0 z-40">
        <Link href="/gallery" className="flex items-center gap-2">
          <span className="text-xl font-bold text-[var(--accent)]">Abi</span>
          <span className="font-technical text-xs tracking-widest text-[var(--text-muted)] mt-1">CLIENT GALLERY</span>
        </Link>

        <div className="flex items-center gap-6">
          <NotificationBell />
          <span className="text-sm text-[var(--text-secondary)] hidden sm:block">
            Welcome, {session.user.name || session.user.email}
          </span>
          <form action="/api/auth/signout" method="POST" className="inline">
            <button type="submit" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 text-sm cursor-pointer bg-transparent border-none">
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Main Proofing Content */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
