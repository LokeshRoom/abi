import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Manually parse .env.local to ensure variables are populated during direct tsx runs
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    });
  }
} catch (e) {
  console.warn("Could not manually load .env.local:", e);
}

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Supabase environment variables are missing in seed script.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("Seeding database and authenticating admin...");

  // 1. Authenticate / Create Admin in Supabase Auth
  const adminEmail = "admin@abiphotostudio.com";
  const adminPassword = "password123"; // Admin should change this after login

  console.log("Checking Supabase Auth for existing admin...");
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (listError) {
    throw new Error(`Failed to list Supabase users: ${listError.message}`);
  }

  const existingSupabaseAdmin = users.find((u) => u.email === adminEmail);
  let adminId = "";

  if (!existingSupabaseAdmin) {
    console.log("Admin user not found in Supabase Auth. Creating...");
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: "ADMIN",
        name: "Abishek",
      },
    });

    if (createError || !createData.user) {
      throw new Error(`Failed to create admin in Supabase: ${createError?.message}`);
    }
    console.log("Admin user created in Supabase Auth.");
    adminId = createData.user.id;
  } else {
    console.log("Admin user already exists in Supabase Auth.");
    adminId = existingSupabaseAdmin.id;
  }

  // 2. Synchronize Admin in Local Database
  const localAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (localAdmin && localAdmin.id !== adminId) {
    console.log(`Re-mapping local admin ID from ${localAdmin.id} to ${adminId}`);
    // Clear out sessions first to prevent foreign key errors during re-map
    await prisma.session.deleteMany({ where: { userId: localAdmin.id } });
    await prisma.user.delete({ where: { email: adminEmail } });
  }

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      id: adminId,
      name: "Abishek",
      role: "ADMIN",
    },
    create: {
      id: adminId,
      email: adminEmail,
      name: "Abishek",
      role: "ADMIN",
    },
  });

  console.log(`Admin user synchronized in database: ${admin.email} (ID: ${adminId})`);

  // 3. Create default categories
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

  // 4. Create default testimonials
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
