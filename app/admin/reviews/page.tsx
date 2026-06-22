import { prisma } from "@/lib/db";
import ReviewsClient from "@/components/admin/reviews-client";

export const dynamic = "force-dynamic";

export default async function AdminReviews() {
  const reviews = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedReviews = reviews.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return <ReviewsClient initialReviews={serializedReviews as any} />;
}
