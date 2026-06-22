import { prisma } from "@/lib/db";
import ClientsClient from "@/components/admin/clients-client";

export const dynamic = "force-dynamic";

export default async function AdminClients() {
  const [clients, galleries] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CLIENT" },
      include: {
        galleries: {
          include: {
            gallery: true,
          },
        },
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.gallery.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const serializedClients = clients.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return <ClientsClient initialClients={serializedClients as any} galleries={galleries} />;
}
