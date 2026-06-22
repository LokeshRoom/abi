import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";

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
