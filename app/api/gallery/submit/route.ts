import { getServerSession, authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mail";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { galleryId } = await req.json();
    if (!galleryId) {
      return NextResponse.json({ error: "Gallery ID is required" }, { status: 400 });
    }

    // Check that user actually has access to this gallery
    const access = await prisma.galleryAccess.findUnique({
      where: {
        userId_galleryId: {
          userId: session.user.id,
          galleryId,
        },
      },
      include: {
        gallery: true,
      },
    });

    if (!access) {
      return NextResponse.json({ error: "Gallery access not found" }, { status: 404 });
    }

    if (access.submitted) {
      return NextResponse.json({ error: "Gallery has already been submitted" }, { status: 400 });
    }

    // 1. Mark as submitted in the database
    await prisma.galleryAccess.update({
      where: {
        id: access.id,
      },
      data: {
        submitted: true,
        submittedAt: new Date(),
      },
    });

    // 2. Fetch the selections and notes for this user's gallery
    const userSelections = await prisma.photoSelection.findMany({
      where: {
        userId: session.user.id,
        photo: {
          galleryId,
        },
      },
      include: {
        photo: true,
      },
    });

    const selectedCount = userSelections.length;

    // 3. Create db notifications for all admins
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
    });

    const notificationMessage = `Client ${session.user.name} (${session.user.email}) submitted ${selectedCount} selected photos for gallery "${access.gallery.title}".`;
    const galleryLink = `/admin/galleries/${galleryId}`;

    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: "New Gallery Submission",
          message: notificationMessage,
          link: galleryLink,
        })),
      });
    }

    // 4. Send emails to admins
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #111; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">New Gallery Submission</h2>
        <p>Hi Admin,</p>
        <p><strong>${session.user.name}</strong> (${session.user.email}) has submitted their selection for the gallery <strong>"${access.gallery.title}"</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f9f9f9;">
            <th style="text-align: left; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Selections</th>
            <td style="padding: 8px; border: 1px solid #ddd;">${selectedCount} photos selected</td>
          </tr>
          <tr>
            <th style="text-align: left; padding: 8px; border: 1px solid #ddd; font-weight: bold;">Submitted At</th>
            <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
          </tr>
        </table>

        <p>You can view their selected photos and specific retouching notes in the Admin Dashboard:</p>
        <div style="margin: 25px 0; text-align: center;">
          <a href="${baseUrl}${galleryLink}" 
             style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            View Client Selections
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px; text-align: center;">Abi Photo Studio</p>
      </div>
    `;

    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: `[Submission] Selections for ${access.gallery.title}`,
        html: emailHtml,
      });
    }

    return NextResponse.json({ success: true, selectedCount });
  } catch (err: any) {
    console.error("Error submitting gallery:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
