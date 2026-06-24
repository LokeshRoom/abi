import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, newEmail, newPassword, currentPassword } = await req.json();

    if (!currentPassword) {
      return NextResponse.json(
        { error: "Current password is required to save changes" },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const currentEmail = session.user.email;

    if (!currentEmail) {
      return NextResponse.json(
        { error: "User email not found in session" },
        { status: 400 }
      );
    }

    // 1. Verify current password by signing in
    const supabase = await createClient();
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: currentPassword,
      });

    if (signInError || !signInData.user) {
      return NextResponse.json(
        { error: "Incorrect current password" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const updateData: any = {};

    // 2. Process email change if requested
    if (newEmail && newEmail !== currentEmail) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json(
          { error: "Invalid email address format" },
          { status: 400 }
        );
      }

      // Check if email already exists in local DB
      const existingUser = await prisma.user.findUnique({
        where: { email: newEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email address is already in use" },
          { status: 400 }
        );
      }

      updateData.email = newEmail;
      updateData.email_confirm = true; // Auto-confirm to avoid out of sync state
    }

    // 3. Process password change if requested
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long" },
          { status: 400 }
        );
      }
      updateData.password = newPassword;
    }

    // 4. Process name change if requested
    const currentMetadata = signInData.user.user_metadata || {};
    if (name && name !== currentMetadata.name) {
      updateData.user_metadata = {
        ...currentMetadata,
        name: name,
      };
    }

    // 5. Update Supabase Auth if there are changes
    if (Object.keys(updateData).length > 0) {
      const { error: updateAuthError } =
        await supabaseAdmin.auth.admin.updateUserById(userId, updateData);

      if (updateAuthError) {
        console.error("Supabase update error:", updateAuthError);
        return NextResponse.json(
          { error: updateAuthError.message || "Failed to update authentication credentials" },
          { status: 400 }
        );
      }
    }

    // 6. Update local Database if email or name changed
    const dbUpdateData: any = {};
    if (newEmail && newEmail !== currentEmail) {
      dbUpdateData.email = newEmail;
    }
    if (name && name !== session.user.name) {
      dbUpdateData.name = name;
    }

    if (Object.keys(dbUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: dbUpdateData,
      });
    }

    return NextResponse.json(
      { success: true, message: "Settings updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Settings update API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
