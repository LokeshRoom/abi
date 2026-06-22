import { prisma } from "@/lib/db";
import GalleriesClient from "@/components/admin/galleries-client";

export const dynamic = "force-dynamic";

export default async function AdminGalleries() {
  const galleries = await prisma.gallery.findMany({
    include: {
      _count: {
        select: { photos: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedGalleries = galleries.map((g) => ({
    ...g,
    expiresAt: g.expiresAt ? g.expiresAt.toISOString() : null,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  }));

  return <GalleriesClient initialGalleries={serializedGalleries as any} />;
}
