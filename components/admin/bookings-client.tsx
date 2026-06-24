"use client";

import { useState } from "react";
import { Calendar, MapPin, Mail, Phone, Clock, Check, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  eventType: string;
  eventDate: string; // ISO string from JSON serialization
  location: string | null;
  message: string | null;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}

export default function BookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [filter, setFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus as any } : b))
      );
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error updating status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === "ALL") return true;
    return b.status === filter;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "CONFIRMED":
        return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default:
        return "bg-red-500/10 text-red-400 border border-red-500/20";
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bookings Manager</h1>
          <p className="text-[var(--text-secondary)] text-sm">Review, confirm, or complete client session bookings.</p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg">
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-technical transition-all cursor-pointer ${
                filter === status
                  ? "bg-[var(--accent)] text-[var(--bg-primary)] font-bold shadow-[0_0_10px_var(--accent-glow)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 flex flex-col lg:flex-row justify-between lg:items-center gap-6 hover:border-[var(--border-hover)] transition-all duration-[var(--transition-base)]"
          >
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-technical ${getStatusBadgeClass(booking.status)}`}>
                  {booking.status}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-technical flex items-center gap-1">
                  <Clock size={12} />
                  SUBMITTED {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold mb-1">{booking.name}</h2>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-[var(--text-secondary)]">
                  <a href={`mailto:${booking.email}`} className="hover:text-[var(--accent)] flex items-center gap-1.5">
                    <Mail size={14} />
                    {booking.email}
                  </a>
                  {booking.phone && (
                    <a href={`tel:${booking.phone}`} className="hover:text-[var(--accent)] flex items-center gap-1.5">
                      <Phone size={14} />
                      {booking.phone}
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="p-1.5 rounded bg-[var(--border)] text-[var(--accent)]">
                    <Calendar size={14} />
                  </span>
                  <div>
                    <p className="text-[10px] font-technical text-[var(--text-muted)]">EVENT DATE</p>
                    <p className="font-semibold">{new Date(booking.eventDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="p-1.5 rounded bg-[var(--border)] text-[var(--accent)]">
                    <MapPin size={14} />
                  </span>
                  <div>
                    <p className="text-[10px] font-technical text-[var(--text-muted)]">LOCATION</p>
                    <p className="font-semibold">{booking.location || "Not specified"}</p>
                  </div>
                </div>
              </div>

              {booking.message && (
                <div className="p-3 bg-[var(--bg-primary)]/40 border border-[var(--border)] rounded-lg text-sm">
                  <p className="text-[10px] font-technical text-[var(--text-muted)] mb-1">CLIENT VISION / MESSAGE</p>
                  <p className="text-[var(--text-secondary)] italic leading-relaxed">{booking.message}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-[var(--border)] pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto">
              {booking.status === "PENDING" && (
                <>
                  <button
                    disabled={updatingId === booking.id}
                    onClick={() => handleStatusUpdate(booking.id, "CONFIRMED")}
                    className="w-full sm:flex-1 lg:w-32 py-2 px-3 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Check size={14} />
                    Confirm
                  </button>
                  <button
                    disabled={updatingId === booking.id}
                    onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                    className="w-full sm:flex-1 lg:w-32 py-2 px-3 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </>
              )}

              {booking.status === "CONFIRMED" && (
                <>
                  <button
                    disabled={updatingId === booking.id}
                    onClick={() => handleStatusUpdate(booking.id, "COMPLETED")}
                    className="w-full sm:flex-1 lg:w-32 py-2 px-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Check size={14} />
                    Complete
                  </button>
                  <button
                    disabled={updatingId === booking.id}
                    onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                    className="w-full sm:flex-1 lg:w-32 py-2 px-3 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </>
              )}

              {(booking.status === "COMPLETED" || booking.status === "CANCELLED") && (
                <button
                  disabled={updatingId === booking.id}
                  onClick={() => handleStatusUpdate(booking.id, "PENDING")}
                  className="w-full lg:w-32 py-2 px-3 bg-[var(--border)] border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <AlertTriangle size={14} />
                  Re-open
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center text-[var(--text-muted)] font-technical">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
            NO BOOKINGS FOUND WITH STATUS: {filter}
          </div>
        )}
      </div>
    </div>
  );
}
