import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Camera, Eye, Trash } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminGalleries() {
  const galleries = await prisma.gallery.findMany({
    include: {
      _count: {
        select: { photos: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Galleries</h1>
          <p className="text-[var(--text-secondary)] text-sm">Manage your photography galleries and client access.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--bg-primary)] font-semibold rounded-lg hover:shadow-[0_0_15px_var(--accent-glow)] transition-all">
          <Plus size={18} />
          <span>New Gallery</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery) => (
          <div key={gallery.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 flex flex-col justify-between hover:border-[var(--border-hover)] transition-all duration-[var(--transition-base)]">
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-technical ${gallery.isPublic ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                  {gallery.isPublic ? 'PUBLIC' : 'PRIVATE'}
                </span>
                <span className="text-[var(--text-muted)] text-xs font-technical">{gallery._count.photos} PHOTOS</span>
              </div>
              <h2 className="text-lg font-bold mb-2 line-clamp-1">{gallery.title}</h2>
              {gallery.description && (
                <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{gallery.description}</p>
              )}
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--border)]">
              <Link href={`/gallery/${gallery.slug}`} target="_blank" className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
                <Eye size={14} />
                <span>View</span>
              </Link>
              <button className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400 transition-colors">
                <Trash size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}

        {galleries.length === 0 && (
          <div className="col-span-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center text-[var(--text-muted)] font-technical">
            <Camera className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
            NO GALLERIES CREATED YET
          </div>
        )}
      </div>
    </div>
  );
}
