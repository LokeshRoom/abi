import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getServerSession, authOptions } from "@/lib/auth";
import { GalleryClient } from "./gallery-client";

export default async function ClientGalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return null;
  }

  const { id } = await params;

  // Find gallery by slug or ID
  const gallery = await prisma.gallery.findFirst({
    where: {
      OR: [
        { id },
        { slug: id }
      ]
    },
    include: {
      photos: {
        orderBy: { order: 'asc' }
      },
      access: true
    }
  });

  if (!gallery) {
    notFound();
  }

  // Ensure user has access
  const hasAccess = session.user.role === "ADMIN" || gallery.access.some(a => a.userId === session.user.id);
  
  if (!hasAccess && !gallery.isPublic) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-[var(--text-secondary)]">You do not have permission to view this gallery.</p>
      </div>
    );
  }

  // Fetch client's existing selections and notes for this gallery
  const selections = await prisma.photoSelection.findMany({
    where: {
      userId: session.user.id,
      photo: {
        galleryId: gallery.id
      }
    },
    select: {
      photoId: true,
      note: true
    }
  });

  return (
    <GalleryClient
      gallery={{
        id: gallery.id,
        title: gallery.title,
        description: gallery.description,
        slug: gallery.slug,
        photos: gallery.photos.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          blobUrl: p.blobUrl,
          blurDataUrl: p.blurDataUrl,
          width: p.width,
          height: p.height
        }))
      }}
      initialSelections={selections}
    />
  );
}
