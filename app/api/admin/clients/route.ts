import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password, galleryIds } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists in local DB
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email address already exists" },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth first
    const supabaseAdmin = createAdminClient();
    const { data: supabaseUser, error: supabaseError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          role: "CLIENT",
          name,
        },
      });

    if (supabaseError || !supabaseUser.user) {
      console.error("Supabase auth user creation failed:", supabaseError);
      return NextResponse.json(
        { error: supabaseError?.message || "Failed to create user in Supabase Auth" },
        { status: 400 }
      );
    }

    // Create user and gallery access in our local database, using the Supabase ID
    let client;
    try {
      client = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            id: supabaseUser.user.id, // Match the Supabase Auth ID
            name,
            email,
            role: "CLIENT",
          },
        });

        if (galleryIds && Array.isArray(galleryIds) && galleryIds.length > 0) {
          await tx.galleryAccess.createMany({
            data: galleryIds.map((galleryId) => ({
              userId: newUser.id,
              galleryId,
            })),
          });
        }

        return newUser;
      });
    } catch (dbError) {
      // Rollback: delete user from Supabase Auth
      await supabaseAdmin.auth.admin.deleteUser(supabaseUser.user.id);
      throw dbError;
    }

    // Query shared galleries details for the welcome notification & email
    const sharedGalleries =
      galleryIds && Array.isArray(galleryIds) && galleryIds.length > 0
        ? await prisma.gallery.findMany({
            where: {
              id: { in: galleryIds },
            },
          })
        : [];

    // Create welcome notification in the database
    await prisma.notification.create({
      data: {
        userId: client.id,
        title: "Welcome to Abi Photo Studio!",
        message: `Welcome, ${name}! Your account has been created. You can view your shared galleries now.`,
        link: "/gallery",
      },
    });

    // Send welcome email to the client
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const galleriesListHtml =
      sharedGalleries.length > 0
        ? `
        <p>You have access to the following galleries:</p>
        <ul style="padding-left: 20px; line-height: 1.6; margin: 15px 0;">
          ${sharedGalleries
            .map(
              (g) =>
                `<li style="margin-bottom: 8px;"><a href="${baseUrl}/gallery/${g.id}" style="color: #000; font-weight: bold; text-decoration: underline;">${g.title}</a></li>`
            )
            .join("")}
        </ul>
      `
        : `<p>Your photographer will add galleries to your account soon.</p>`;

    const welcomeEmailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #111; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Welcome to Abi Photo Studio</h2>
        <p>Hi ${name},</p>
        <p>Your photographer has created an account for you. You can now log in to view your photo galleries, select your favorite photos, and submit feedback.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0; border: 1px solid #eaeaea;">
          <h3 style="margin-top: 0; color: #333;">Your Login Credentials</h3>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
        </div>

        ${galleriesListHtml}

        <div style="margin: 25px 0; text-align: center;">
          <a href="${baseUrl}/login" 
             style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Log In to Your Dashboard
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px; text-align: center;">Abi Photo Studio</p>
      </div>
    `;

    try {
      await sendEmail({
        to: email,
        subject: "Welcome to Abi Photo Studio - Your Account is Ready",
        html: welcomeEmailHtml,
      });
    } catch (emailErr) {
      console.error("Failed to send welcome email:", emailErr);
    }

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
