import { prisma } from "@/lib/db";
import { BlogsClient } from "./blogs-client";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <BlogsClient initialPosts={posts} />;
}
