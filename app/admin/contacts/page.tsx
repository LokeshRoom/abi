import { prisma } from "@/lib/db";
import ContactsClient from "@/components/admin/contacts-client";

export const dynamic = "force-dynamic";

export default async function AdminContacts() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedMessages = messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return <ContactsClient initialMessages={serializedMessages as any} />;
}
