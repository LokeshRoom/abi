import { getServerSession, authOptions } from "@/lib/auth";
import SettingsForm from "@/components/auth/settings-form";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/gallery/settings");
  }

  const initialName = session.user.name || "";
  const initialEmail = session.user.email || "";

  return (
    <div className="container-abi py-12 md:py-20 max-w-4xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">Settings</h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Manage your client profile and security credentials.
        </p>
      </div>

      <div className="mt-8">
        <SettingsForm
          initialName={initialName}
          initialEmail={initialEmail}
          role="CLIENT"
        />
      </div>
    </div>
  );
}
