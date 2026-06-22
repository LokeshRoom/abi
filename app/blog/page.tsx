import { prisma } from "@/lib/db";
import { Newspaper } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

function getReadTime(content: string) {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <main className="min-h-screen pt-28 pb-20" style={{ background: "var(--bg-primary)" }}>
      <div className="container-abi">
        {/* Header */}
        <div className="text-center mb-16">
          <p
            className="font-technical tracking-[0.3em] mb-4 flex items-center justify-center gap-2"
            style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
          >
            <Newspaper size={14} />
            JOURNAL
          </p>
          <h1
            className="font-bold mb-4 font-serif"
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "var(--text-3xl)",
              color: "var(--text-primary)",
            }}
          >
            Behind the Lens
          </h1>
          <p
            className="max-w-lg mx-auto"
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-outfit)",
            }}
          >
            Stories, photography tips, and creative insights from my visual journey.
          </p>
        </div>

        {/* Articles Grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {posts.map((article) => {
              const readTime = getReadTime(article.content);
              const formattedDate = article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : new Date(article.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });

              return (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="group rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 block cursor-pointer"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border)",
                  }}
                >
                  {/* Cover Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-[var(--bg-primary)]">
                    {article.coverImage ? (
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                        <Newspaper size={40} />
                      </div>
                    )}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div
                      className="flex items-center gap-3 mb-3 font-technical text-xs"
                      style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                    >
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{readTime} min read</span>
                    </div>
                    <h2
                      className="text-lg font-semibold mb-2 group-hover:text-[var(--accent)] transition-colors duration-300 line-clamp-2"
                      style={{
                        fontFamily: "var(--font-outfit)",
                        color: "var(--text-primary)",
                      }}
                    >
                      {article.title}
                    </h2>
                    <p
                      className="text-sm leading-relaxed line-clamp-3"
                      style={{
                        color: "var(--text-secondary)",
                        fontFamily: "var(--font-outfit)",
                      }}
                    >
                      {article.excerpt || "Click to read the full journal entry."}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center max-w-md mx-auto py-20 border border-dashed border-[var(--border)] rounded-2xl bg-[var(--bg-card)]">
            <Newspaper className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
            <p className="font-technical text-sm text-[var(--text-muted)] tracking-wider">
              JOURNAL IS CURRENTLY EMPTY
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Check back soon for new articles and announcements.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
