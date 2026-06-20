import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [galleryCount, photoCount, clientCount, bookingCount] = await Promise.all([
    prisma.gallery.count(),
    prisma.photo.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.booking.count(),
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border)]">
          <p className="font-technical text-xs text-[var(--text-muted)] mb-2">TOTAL GALLERIES</p>
          <p className="text-4xl font-bold">{galleryCount}</p>
        </div>
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border)]">
          <p className="font-technical text-xs text-[var(--text-muted)] mb-2">PHOTOS UPLOADED</p>
          <p className="text-4xl font-bold">{photoCount}</p>
        </div>
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border)]">
          <p className="font-technical text-xs text-[var(--text-muted)] mb-2">ACTIVE CLIENTS</p>
          <p className="text-4xl font-bold">{clientCount}</p>
        </div>
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border)]">
          <p className="font-technical text-xs text-[var(--text-muted)] mb-2">BOOKING REQUESTS</p>
          <p className="text-4xl font-bold">{bookingCount}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-6">Recent Bookings</h2>
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-8 text-center text-[var(--text-muted)] font-technical text-sm">
          NO RECENT BOOKINGS FOUND
        </div>
      </div>
    </div>
  );
}
