import { getServerSession, authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// POST: Toggle photo selection
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { photoId } = await req.json();
    if (!photoId) {
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 });
    }

    // Find the photo and confirm the gallery is accessible
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        gallery: {
          include: {
            access: true,
          },
        },
      },
    });

    if (!photo || !photo.gallery) {
      return NextResponse.json({ error: "Photo or gallery not found" }, { status: 404 });
    }

    // Verify user access
    const isPublic = photo.gallery.isPublic;
    const hasAccess =
      session.user.role === "ADMIN" ||
      photo.gallery.access.some((a) => a.userId === session.user.id);

    if (!isPublic && !hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Verify gallery is not already submitted and locked for clients
    const clientAccess = photo.gallery.access.find((a) => a.userId === session.user.id);
    if (session.user.role !== "ADMIN" && clientAccess?.submitted) {
      return NextResponse.json({ error: "Gallery is already submitted and locked" }, { status: 400 });
    }

    // Check if selection already exists
    const existing = await prisma.photoSelection.findUnique({
      where: {
        userId_photoId: {
          userId: session.user.id,
          photoId,
        },
      },
    });

    if (existing) {
      // Toggle off (delete selection)
      await prisma.photoSelection.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ selected: false });
    } else {
      // Toggle on (create selection)
      const newSelection = await prisma.photoSelection.create({
        data: {
          userId: session.user.id,
          photoId,
        },
      });
      return NextResponse.json({ selected: true, selectionId: newSelection.id });
    }
  } catch (err: any) {
    console.error("Error toggling selection:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT: Update notes/feedback on a photo selection
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { photoId, note } = await req.json();
    if (!photoId) {
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 });
    }

    // Find the photo and confirm the gallery is accessible
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: {
        gallery: {
          include: {
            access: true,
          },
        },
      },
    });

    if (!photo || !photo.gallery) {
      return NextResponse.json({ error: "Photo or gallery not found" }, { status: 404 });
    }

    // Verify user access
    const isPublic = photo.gallery.isPublic;
    const hasAccess =
      session.user.role === "ADMIN" ||
      photo.gallery.access.some((a) => a.userId === session.user.id);

    if (!isPublic && !hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Verify gallery is not already submitted and locked for clients
    const clientAccess = photo.gallery.access.find((a) => a.userId === session.user.id);
    if (session.user.role !== "ADMIN" && clientAccess?.submitted) {
      return NextResponse.json({ error: "Gallery is already submitted and locked" }, { status: 400 });
    }

    // Find or create selection to attach note to
    const selection = await prisma.photoSelection.upsert({
      where: {
        userId_photoId: {
          userId: session.user.id,
          photoId,
        },
      },
      update: {
        note: note || null,
      },
      create: {
        userId: session.user.id,
        photoId,
        note: note || null,
      },
    });

    return NextResponse.json({ success: true, selectionId: selection.id, note: selection.note });
  } catch (err: any) {
    console.error("Error updating selection note:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
