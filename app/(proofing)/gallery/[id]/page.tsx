import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getServerSession, authOptions } from "@/lib/auth";

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

  return (
    <div className="relative">
      {/* Gallery Header */}
      <div className="py-12 px-6 border-b border-[var(--border)] text-center">
        <h1 className="text-4xl font-bold mb-4">{gallery.title}</h1>
        {gallery.description && (
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">{gallery.description}</p>
        )}
        <div className="mt-6 font-technical text-sm text-[var(--text-muted)] tracking-widest">
          {gallery.photos.length} PHOTOS
        </div>
      </div>

      {/* Photo Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.photos.map((photo) => (
            <div key={photo.id} className="relative aspect-[3/2] rounded-lg overflow-hidden group bg-[var(--bg-card)]">
              <Image
                src={photo.blobUrl}
                alt={photo.title || "Gallery photo"}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-[var(--transition-cinematic)] group-hover:scale-105"
                placeholder={photo.blurDataUrl ? "blur" : "empty"}
                blurDataURL={photo.blurDataUrl || undefined}
              />
              {/* Future: Selection checkbox overlay will go here */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <span className="text-white text-sm font-medium">{photo.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
