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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
