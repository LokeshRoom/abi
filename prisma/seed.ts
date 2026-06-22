import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default admin user
  const adminPassword = "password123"; // INSECURE: Change this after login
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@abiphotostudio.com" },
    update: {},
    create: {
      email: "admin@abiphotostudio.com",
      name: "Abishek",
      passwordHash: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`Admin user created: ${admin.email} / ${adminPassword}`);

  // Create default categories
  const categories = [
    { name: "Portraits", slug: "portraits", order: 1 },
    { name: "Events", slug: "events", order: 2 },
    { name: "Street", slug: "street", order: 3 },
    { name: "Cinematic", slug: "cinematic", order: 4 },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  console.log("Categories seeded");

  // Create default testimonials
  const testimonials = [
    {
      id: "seed-t1",
      name: "Priya & Karthik",
      role: "Wedding Client",
      content: "Abi captured our wedding day with such artistry. Every frame tells a story we'll cherish forever. His eye for those fleeting, candid moments is truly extraordinary.",
      rating: 5,
      featured: true,
    },
    {
      id: "seed-t2",
      name: "Deepa Ramasamy",
      role: "Portrait Client",
      content: "The portrait session exceeded all expectations. The lighting, composition, and post-processing were absolutely flawless. I've never felt more confident in photos.",
      rating: 5,
      featured: true,
    },
    {
      id: "seed-t3",
      name: "Arjun Menon",
      role: "Creative Director, Lunar Co.",
      content: "Working with Abi on our brand campaign was seamless. He understood our vision instantly and delivered images that elevated our entire brand identity.",
      rating: 5,
      featured: true,
    },
    {
      id: "seed-t4",
      name: "Meera Suresh",
      role: "Event Organizer",
      content: "His cinematic approach to event photography is unmatched. Every photo feels like a still from a film — dramatic, emotional, and perfectly timed.",
      rating: 5,
      featured: true,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.upsert({
      where: { id: testimonial.id },
      update: {},
      create: testimonial,
    });
  }

  console.log("Testimonials seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
