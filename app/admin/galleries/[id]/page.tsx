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
      access: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!gallery) {
    notFound();
  }

  // Fetch all selections for photos in this gallery
  const selections = await prisma.photoSelection.findMany({
    where: {
      photo: {
        galleryId: gallery.id,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      photo: {
        select: {
          id: true,
          title: true,
          blobUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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
    access: gallery.access.map((a) => ({
      ...a,
      submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
    })),
  };

  const serializedSelections = selections.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <GalleryDetailClient
      gallery={serializedGallery as any}
      selections={serializedSelections as any}
    />
  );
}
