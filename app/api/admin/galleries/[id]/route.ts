import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession, authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Delete gallery (associated photos/access are handled by cascade delete if configured, or we should delete access first)
    // Wait, in schema.prisma, GalleryAccess has `onDelete: Cascade`:
    // gallery   Gallery @relation(fields: [galleryId], references: [id], onDelete: Cascade)
    // Photo Selection does not have gallery relation.
    // Photo model has gallery relation:
    // gallery      Gallery?   @relation(fields: [galleryId], references: [id])
    // Note that photo relation doesn't have onDelete: Cascade. So if we delete a gallery, the photos will have their galleryId set to null, or we can choose to delete photos, or database will set null. Let's inspect schema:
    // model Photo { ... galleryId String? ... }
    // Since galleryId is optional, deleting a gallery will just set it to null or succeed, but if there's any reference, we can delete the gallery directly.
    await prisma.gallery.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Gallery deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting gallery:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
