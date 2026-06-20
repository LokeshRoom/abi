import { Newspaper } from "lucide-react";

const demoArticles = [
  {
    slug: "behind-the-lens-golden-hour",
    title: "Behind the Lens: Chasing the Golden Hour",
    excerpt:
      "How I plan my shoots around that magical 20-minute window when light becomes pure gold.",
    date: "June 15, 2026",
    readTime: "5 min read",
    cover: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450&fit=crop",
  },
  {
    slug: "gear-review-rf-85mm",
    title: "Gear Diary: The RF 85mm f/1.2 — One Year Later",
    excerpt:
      "A year of portraits, weddings, and street shots through Canon's crown jewel.",
    date: "May 28, 2026",
    readTime: "8 min read",
    cover: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=450&fit=crop",
  },
  {
    slug: "wedding-season-tips",
    title: "5 Things I Wish I Knew Before My First Wedding Shoot",
    excerpt:
      "From backup gear to reading the room — lessons learned the hard way so you don't have to.",
    date: "May 10, 2026",
    readTime: "6 min read",
    cover: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&h=450&fit=crop",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen pt-28 pb-20" style={{ background: "var(--bg-primary)" }}>
      <div className="container-abi">
        {/* Header */}
        <div className="text-center mb-16">
          <p
            className="font-technical tracking-[0.3em] mb-4"
            style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
          >
            <Newspaper className="inline-block w-3 h-3 mr-2 -mt-0.5" />
            JOURNAL
          </p>
          <h1
            className="font-bold mb-4"
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
            Stories, gear reviews, and insights from the field.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {demoArticles.map((article) => (
            <article
              key={article.slug}
              className="group rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              {/* Cover Image */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={article.cover}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div
                  className="flex items-center gap-3 mb-3 font-technical"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
                >
                  <span>{article.date}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>
                <h2
                  className="text-lg font-semibold mb-2 group-hover:text-[#E8632B] transition-colors duration-300"
                  style={{
                    fontFamily: "var(--font-outfit)",
                    color: "var(--text-primary)",
                  }}
                >
                  {article.title}
                </h2>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-outfit)",
                  }}
                >
                  {article.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
