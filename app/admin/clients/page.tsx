import { prisma } from "@/lib/db";
import { Users, Mail, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminClients() {
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: {
      bookings: true,
      galleries: {
        include: {
          gallery: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Clients</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage user accounts and view client details.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--bg-primary)] font-semibold rounded-lg hover:shadow-[0_0_15px_var(--accent-glow)] transition-all">
          <Plus size={18} />
          <span>Add Client</span>
        </button>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                <th className="p-4 font-technical text-xs text-[var(--text-muted)]">CLIENT NAME</th>
                <th className="p-4 font-technical text-xs text-[var(--text-muted)]">EMAIL</th>
                <th className="p-4 font-technical text-xs text-[var(--text-muted)]">GALLERY ACCESS</th>
                <th className="p-4 font-technical text-xs text-[var(--text-muted)]">BOOKINGS</th>
                <th className="p-4 font-technical text-xs text-[var(--text-muted)]">CREATED AT</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-secondary)]/20 transition-colors">
                  <td className="p-4 font-semibold">{client.name}</td>
                  <td className="p-4 text-[var(--text-secondary)]">
                    <span className="flex items-center gap-2">
                      <Mail size={14} />
                      {client.email}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {client.galleries.map((g) => (
                        <span key={g.id} className="px-2 py-0.5 rounded text-[10px] bg-[var(--border)] text-[var(--text-secondary)] border border-[var(--border)]">
                          {g.gallery.title}
                        </span>
                      ))}
                      {client.galleries.length === 0 && (
                        <span className="text-xs text-[var(--text-muted)]">No galleries assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-[var(--text-secondary)] font-technical text-xs">
                    {client.bookings.length} BOOKINGS
                  </td>
                  <td className="p-4 text-[var(--text-muted)] font-technical text-xs">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[var(--text-muted)] font-technical">
                    <Users className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
                    NO ACTIVE CLIENTS FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
