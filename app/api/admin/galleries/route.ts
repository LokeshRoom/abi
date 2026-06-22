import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession, authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, isPublic, password, expiresAt } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Generate base slug
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    if (!baseSlug) {
      baseSlug = "gallery";
    }

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.gallery.findUnique({
        where: { slug },
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const gallery = await prisma.gallery.create({
      data: {
        title,
        slug,
        description: description || null,
        isPublic: isPublic || false,
        password: password || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(gallery, { status: 201 });
  } catch (error: any) {
    console.error("Error creating gallery:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
