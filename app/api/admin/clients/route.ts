import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";

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

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
