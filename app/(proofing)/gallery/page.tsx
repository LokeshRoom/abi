import { getServerSession, authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FolderOpen, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientGalleriesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/gallery");
  }

  // Fetch galleries this client has access to
  const galleries = await prisma.gallery.findMany({
    where: session.user.role === "ADMIN" ? {} : {
      OR: [
        { isPublic: true },
        {
          access: {
            some: {
              userId: session.user.id,
            },
          },
        },
      ],
    },
    include: {
      _count: {
        select: { photos: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Auto-redirect if they have exactly one gallery
  if (galleries.length === 1) {
    redirect(`/gallery/${galleries[0].slug || galleries[0].id}`);
  }

  return (
    <div className="container-abi py-12 md:py-20">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Your Galleries</h1>
        <p className="text-[var(--text-secondary)]">Select a gallery to view and select your photos.</p>
      </div>

      {galleries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {galleries.map((gallery) => (
            <Link
              key={gallery.id}
              href={`/gallery/${gallery.slug || gallery.id}`}
              className="group rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)] transition-all duration-300 hover:-translate-y-1 block"
            >
              {/* Cover Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-primary)] border-b border-[var(--border)]">
                {gallery.coverUrl ? (
                  <Image
                    src={gallery.coverUrl}
                    alt={gallery.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                    <FolderOpen size={48} />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--accent)] transition-colors duration-300">
                  {gallery.title}
                </h2>
                {gallery.description && (
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-4">
                    {gallery.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                  <span>{gallery._count.photos} photos</span>
                  <span className="inline-flex items-center gap-1 text-[var(--accent)] font-semibold font-technical group-hover:translate-x-1 transition-transform">
                    VIEW GALLERY <ArrowRight size={12} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-card)] max-w-md mx-auto">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
          <h2 className="text-lg font-bold mb-1">No Galleries Assigned</h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-xs mx-auto">
            You don't have access to any private galleries yet. Please contact the photographer to request access.
          </p>
        </div>
      )}
    </div>
  );
}
