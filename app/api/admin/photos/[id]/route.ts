import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { deletePhoto } from "@/lib/blob";

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

    // Find photo to get its blobUrl
    const photo = await prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 444 });
    }

    // Delete from database
    await prisma.photo.delete({
      where: { id },
    });

    // Try deleting from Vercel Blob (catch error to prevent blocking DB delete sync)
    try {
      if (photo.blobUrl) {
        await deletePhoto(photo.blobUrl);
      }
    } catch (blobError) {
      console.error("Failed to delete from blob storage:", blobError);
    }

    return NextResponse.json({ message: "Photo deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting photo:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
