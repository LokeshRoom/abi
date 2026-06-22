import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    const data: any = { ...body };

    // Handle published status transition
    if (data.published !== undefined) {
      if (data.published) {
        data.publishedAt = existingPost.publishedAt || new Date();
      } else {
        data.publishedAt = null;
      }
    }

    // Handle slug update or slugify new title if provided
    if (data.slug) {
      data.slug = slugify(data.slug);
      // Ensure the slug is unique (excluding this post)
      const duplicate = await prisma.blogPost.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });
      if (duplicate) {
        data.slug = `${data.slug}-${Math.random().toString(36).substring(2, 6)}`;
      }
    } else if (data.title && data.title !== existingPost.title) {
      // If title changed but slug was not explicitly provided, let's keep the old slug,
      // or we can generate a new one. It's safer to keep the old slug to prevent broken links,
      // but let's allow changing it if requested. Let's keep it unchanged unless they send slug.
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error: any) {
    console.error("Error updating blog post:", error);
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
    const session = await getServerSession();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.blogPost.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Blog post deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
