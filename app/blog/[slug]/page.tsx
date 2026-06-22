import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Clock, Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function getReadTime(content: string) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

function renderBlogPostContent(content: string) {
  return content.split(/\n\s*\n/).map((block, index) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Headings
    if (trimmed.startsWith("# ")) {
      return (
        <h1
          key={index}
          className="text-3xl font-bold mt-8 mb-4 text-[var(--text-primary)] font-serif"
        >
          {trimmed.replace("# ", "")}
        </h1>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={index}
          className="text-2xl font-semibold mt-6 mb-3 text-[var(--text-primary)] font-serif"
        >
          {trimmed.replace("## ", "")}
        </h2>
      );
    }
    if (trimmed.startsWith("### ")) {
      return (
        <h3
          key={index}
          className="text-xl font-medium mt-4 mb-2 text-[var(--text-primary)] font-serif"
        >
          {trimmed.replace("### ", "")}
        </h3>
      );
    }

    // Bullet points
    if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      // Split by newline and remove prefix
      const lines = trimmed.split("\n");
      return (
        <ul
          key={index}
          className="list-disc pl-5 my-4 space-y-2 text-[var(--text-secondary)] leading-relaxed text-sm md:text-base"
        >
          {lines.map((line, i) => {
            const cleanLine = line.replace(/^[*\-]\s+/, "");
            return <li key={i}>{cleanLine}</li>;
          })}
        </ul>
      );
    }

    // Standard paragraph
    return (
      <p
        key={index}
        className="mb-6 leading-relaxed text-[var(--text-secondary)] text-sm md:text-base whitespace-pre-line"
      >
        {trimmed}
      </p>
    );
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  // If the post does not exist or is not published, return 404
  if (!post || !post.published) {
    notFound();
  }

  const readTime = getReadTime(post.content);
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date(post.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <main
      className="min-h-screen pt-28 pb-20 px-4 md:px-0"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Back navigation */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-technical text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-8 group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>BACK TO JOURNAL</span>
        </Link>

        <article
          className="rounded-2xl border overflow-hidden shadow-xl"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--border)",
          }}
        >
          {/* Cover Photo */}
          {post.coverImage && (
            <div className="relative aspect-[16/9] w-full bg-[var(--bg-primary)]">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Article Header */}
          <div className="p-6 md:p-10 border-b border-[var(--border)]">
            <div className="flex flex-wrap items-center gap-4 text-xs font-technical text-[var(--text-muted)] mb-4">
              <span className="flex items-center gap-1.5">
                <Calendar size={12} className="text-[var(--accent)]" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-[var(--accent)]" />
                {readTime} min read
              </span>
            </div>

            <h1
              className="text-2xl md:text-4xl font-bold font-serif mb-4 leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {post.title}
            </h1>

            {post.excerpt && (
              <p
                className="text-sm md:text-base leading-relaxed italic"
                style={{ color: "var(--text-secondary)" }}
              >
                {post.excerpt}
              </p>
            )}
          </div>

          {/* Article Content */}
          <div className="p-6 md:p-10 font-sans text-[var(--text-secondary)]">
            {renderBlogPostContent(post.content)}
          </div>
        </article>
      </div>
    </main>
  );
}
