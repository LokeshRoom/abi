import { prisma } from "@/lib/db";
import Link from "next/link";
import { Calendar, MessageSquare, Star, Camera, Users, Clock, MailOpen, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    galleryCount,
    photoCount,
    clientCount,
    bookingCount,
    pendingBookings,
    unreadContacts,
    totalReviews,
    recentBookings,
    recentContacts,
  ] = await Promise.all([
    prisma.gallery.count(),
    prisma.photo.count(),
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.testimonial.count(),
    prisma.booking.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    prisma.contactMessage.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-[var(--text-secondary)] text-sm">Welcome back! Here is a summary of your studio status.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border)] relative overflow-hidden group hover:border-[var(--border-hover)] transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2.5 rounded-lg bg-[var(--border)] text-[var(--accent)]">
              <Calendar size={20} />
            </span>
            {pendingBookings > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#E8632B]/10 text-[#E8632B] border border-[#E8632B]/20 font-technical animate-pulse">
                {pendingBookings} PENDING
              </span>
            )}
          </div>
          <p className="font-technical text-xs text-[var(--text-muted)] mb-1">BOOKINGS</p>
          <p className="text-3xl font-bold">{bookingCount}</p>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border)] relative overflow-hidden group hover:border-[var(--border-hover)] transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2.5 rounded-lg bg-[var(--border)] text-[var(--accent)]">
              <MessageSquare size={20} />
            </span>
            {unreadContacts > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#A8D841]/10 text-[#A8D841] border border-[#A8D841]/20 font-technical">
                {unreadContacts} UNREAD
              </span>
            )}
          </div>
          <p className="font-technical text-xs text-[var(--text-muted)] mb-1">INQUIRIES</p>
          <p className="text-3xl font-bold">{unreadContacts + (bookingCount - pendingBookings)}</p>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border)] relative overflow-hidden group hover:border-[var(--border-hover)] transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2.5 rounded-lg bg-[var(--border)] text-[var(--accent)]">
              <Star size={20} />
            </span>
          </div>
          <p className="font-technical text-xs text-[var(--text-muted)] mb-1">REVIEWS</p>
          <p className="text-3xl font-bold">{totalReviews}</p>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border)] relative overflow-hidden group hover:border-[var(--border-hover)] transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="p-2.5 rounded-lg bg-[var(--border)] text-[var(--accent)]">
              <Camera size={20} />
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-technical mt-1">
              {clientCount} CLIENTS
            </span>
          </div>
          <p className="font-technical text-xs text-[var(--text-muted)] mb-1">GALLERIES</p>
          <p className="text-3xl font-bold">{galleryCount}</p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock size={18} className="text-[var(--text-muted)]" />
              Recent Bookings
            </h2>
            <Link href="/admin/bookings" className="text-xs text-[var(--accent)] hover:underline">
              View All
            </Link>
          </div>

          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="p-4 hover:bg-[var(--bg-secondary)]/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-sm">{booking.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{booking.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-technical ${
                    booking.status === "PENDING"
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : booking.status === "CONFIRMED"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : booking.status === "COMPLETED"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-[var(--text-muted)] font-technical">
                  <span>{booking.eventType}</span>
                  <span>{new Date(booking.eventDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {recentBookings.length === 0 && (
              <div className="p-8 text-center text-[var(--text-muted)] font-technical text-sm">
                NO RECENT BOOKINGS FOUND
              </div>
            )}
          </div>
        </div>

        {/* Recent Inquiries / Contacts */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Mail size={18} className="text-[var(--text-muted)]" />
              Recent Contacts
            </h2>
            <Link href="/admin/contacts" className="text-xs text-[var(--accent)] hover:underline">
              View All
            </Link>
          </div>

          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
            {recentContacts.map((contact) => (
              <div key={contact.id} className="p-4 hover:bg-[var(--bg-secondary)]/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-sm flex items-center gap-1.5">
                      {!contact.read && <span className="w-1.5 h-1.5 rounded-full bg-[#A8D841]" />}
                      {contact.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">{contact.subject || "No Subject"}</p>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-technical">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-1 italic">{contact.message}</p>
              </div>
            ))}

            {recentContacts.length === 0 && (
              <div className="p-8 text-center text-[var(--text-muted)] font-technical text-sm">
                NO RECENT INQUIRIES FOUND
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
