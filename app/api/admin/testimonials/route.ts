import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession, authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, role, content, rating, featured } = await req.json();

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required fields" }, { status: 400 });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        role: role || null,
        content,
        rating: rating !== undefined ? parseInt(rating) : 5,
        featured: featured || false,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error: any) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
