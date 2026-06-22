import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession, authOptions } from "@/lib/auth";

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
    const data = await req.json();

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedTestimonial, { status: 200 });
  } catch (error: any) {
    console.error("Error updating testimonial:", error);
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

    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Testimonial deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
