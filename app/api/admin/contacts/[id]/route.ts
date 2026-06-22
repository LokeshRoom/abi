import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { read } = await req.json();

    if (typeof read !== "boolean") {
      return NextResponse.json({ error: "Read status (boolean) is required" }, { status: 400 });
    }

    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: { read },
    });

    return NextResponse.json(updatedMessage, { status: 200 });
  } catch (error: any) {
    console.error("Error updating contact message status:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

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

    await prisma.contactMessage.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Contact message deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting contact message:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
