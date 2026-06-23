import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail } from "@/lib/mail";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Prevent deleting oneself
    if (session.user.id === id) {
      return NextResponse.json({ error: "Cannot delete your own admin account" }, { status: 400 });
    }

    // Delete user from Supabase Auth
    const supabaseAdmin = createAdminClient();
    const { error: supabaseError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (supabaseError) {
      console.warn("Supabase user deletion warned/failed:", supabaseError);
      // We will still proceed with local DB deletion just in case
    }

    // Delete user from DB (onDelete cascade handles galleryAccess, sessions, selections)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Client deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting client:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { galleryIds } = await req.json();

    if (!Array.isArray(galleryIds)) {
      return NextResponse.json({ error: "galleryIds must be an array" }, { status: 400 });
    }

    // Find the client user
    const client = await prisma.user.findUnique({
      where: { id },
      include: {
        galleries: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const existingGalleryIds = client.galleries.map((g) => g.galleryId);
    
    // Determine additions and removals
    const toAdd = galleryIds.filter((gid) => !existingGalleryIds.includes(gid));
    const toRemove = existingGalleryIds.filter((gid) => !galleryIds.includes(gid));

    await prisma.$transaction(async (tx) => {
      // 1. Remove access
      if (toRemove.length > 0) {
        await tx.galleryAccess.deleteMany({
          where: {
            userId: client.id,
            galleryId: { in: toRemove },
          },
        });
      }

      // 2. Add access
      if (toAdd.length > 0) {
        await tx.galleryAccess.createMany({
          data: toAdd.map((gid) => ({
            userId: client.id,
            galleryId: gid,
          })),
        });
      }
    });

    // 3. For any newly added galleries, send notifications & emails
    if (toAdd.length > 0) {
      const addedGalleries = await prisma.gallery.findMany({
        where: {
          id: { in: toAdd },
        },
      });

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

      for (const gallery of addedGalleries) {
        // Create in-app notification
        await prisma.notification.create({
          data: {
            userId: client.id,
            title: "New Gallery Shared",
            message: `Photographer shared a new gallery: "${gallery.title}" with you.`,
            link: `/gallery/${gallery.slug || gallery.id}`,
          },
        });

        // Send email
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
            <h2 style="color: #111; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">New Gallery Shared</h2>
            <p>Hi ${client.name},</p>
            <p>Your photographer has shared a new gallery with you: <strong>"${gallery.title}"</strong>.</p>
            
            <p>You can now view this gallery, select photos, and leave retouching comments.</p>

            <div style="margin: 25px 0; text-align: center;">
              <a href="${baseUrl}/gallery/${gallery.slug || gallery.id}" 
                 style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                View Shared Gallery
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px; text-align: center;">Abi Photo Studio</p>
          </div>
        `;

        try {
          await sendEmail({
            to: client.email,
            subject: `New Shared Gallery - ${gallery.title}`,
            html: emailHtml,
          });
        } catch (emailErr) {
          console.error("Failed to send gallery shared email:", emailErr);
        }
      }
    }

    return NextResponse.json({ success: true, message: "Gallery access updated successfully" });
  } catch (error: any) {
    console.error("Error updating client gallery access:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
