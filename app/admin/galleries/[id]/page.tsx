import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import GalleryDetailClient from "@/components/admin/gallery-detail-client";

export const dynamic = "force-dynamic";

export default async function AdminGalleryDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const gallery = await prisma.gallery.findUnique({
    where: { id },
    include: {
      photos: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!gallery) {
    notFound();
  }

  // Serialize dates
  const serializedGallery = {
    ...gallery,
    expiresAt: gallery.expiresAt ? gallery.expiresAt.toISOString() : null,
    createdAt: gallery.createdAt.toISOString(),
    updatedAt: gallery.updatedAt.toISOString(),
    photos: gallery.photos.map((p) => ({
      ...p,
      dateTaken: p.dateTaken ? p.dateTaken.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
  };

  return <GalleryDetailClient gallery={serializedGallery as any} />;
}
