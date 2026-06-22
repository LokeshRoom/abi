import { prisma } from "@/lib/db";
import BookingsClient from "@/components/admin/bookings-client";

export const dynamic = "force-dynamic";

export default async function AdminBookings() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Serialize dates for Client Component since Next.js server actions / props cannot pass raw Date objects directly in all configurations safely without warnings
  const serializedBookings = bookings.map((b) => ({
    ...b,
    eventDate: b.eventDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  return <BookingsClient initialBookings={serializedBookings as any} />;
}
