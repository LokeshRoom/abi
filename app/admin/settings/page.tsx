import { Settings, Save, Shield, Database, HardDrive, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function AdminSettings({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Check Google Drive connection status
  const gdriveConfig = await prisma.gDriveConfig.findUnique({
    where: { id: "default" },
  });
  const isGDriveConnected = !!gdriveConfig;

  const sp = await searchParams;
  const gdriveStatus = sp?.gdrive as string | undefined;
  const gdriveReason = sp?.reason as string | undefined;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Configure system configurations and credentials.
          </p>
        </div>
      </div>

      {/* OAuth Status Banners */}
      {gdriveStatus === "success" && (
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
          <CheckCircle size={18} className="shrink-0" />
          <p className="text-sm font-medium">
            Google Drive connected successfully!
          </p>
        </div>
      )}
      {gdriveStatus === "error" && (
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <XCircle size={18} className="shrink-0" />
          <p className="text-sm font-medium">
            Google Drive connection failed.{" "}
            {gdriveReason && (
              <span className="opacity-80 font-normal font-technical text-xs">
                Reason: {decodeURIComponent(gdriveReason)}
              </span>
            )}
          </p>
        </div>
      )}

      <div className="space-y-6">

        {/* Google Drive Connection */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
            <HardDrive className="text-[var(--accent)]" size={22} />
            <h2 className="text-xl font-bold">Google Drive Storage</h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              {/* Connection Status Indicator */}
              <div className="flex items-center gap-3">
                {isGDriveConnected ? (
                  <>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20">
                      <CheckCircle size={16} className="text-green-400" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-green-400">Connected</p>
                      <p className="text-xs text-[var(--text-muted)] font-technical">
                        OAuth credentials are stored and active.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20">
                      <XCircle size={16} className="text-red-400" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-red-400">Not Connected</p>
                      <p className="text-xs text-[var(--text-muted)] font-technical">
                        Gallery uploads will fail until you connect Google Drive.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* How it works */}
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
                Photos and videos uploaded to galleries are stored privately in your Google Drive,
                organized into per-gallery folders. Media is streamed securely to clients via the
                server.
              </p>
            </div>

            {/* Connect / Reconnect Button */}
            <div className="shrink-0">
              <Link
                href="/api/admin/gdrive/auth"
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-xl hover:shadow-[0_0_20px_var(--accent-glow)] transition-all text-sm"
              >
                <RefreshCw size={15} />
                {isGDriveConnected ? "Reconnect Google Drive" : "Connect Google Drive"}
              </Link>
              {isGDriveConnected && (
                <p className="text-[10px] text-[var(--text-muted)] text-center mt-2 font-technical">
                  RECONNECT TO REFRESH TOKENS
                </p>
              )}
            </div>
          </div>

          {/* Folder configuration info */}
          {process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID && (
            <div className="mt-5 pt-5 border-t border-[var(--border)] flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <p className="text-xs text-[var(--text-secondary)] font-technical">
                PARENT FOLDER ID:{" "}
                <span className="text-[var(--text-primary)]">
                  {process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Security Section */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
            <Shield className="text-[var(--accent)]" size={22} />
            <h2 className="text-xl font-bold">Admin Credentials</h2>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-technical text-[var(--text-secondary)] mb-2">
                  CONFIRM NEW PASSWORD
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-[var(--border)] border border-[var(--border)] rounded-lg text-sm font-semibold hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] transition-all mt-4"
            >
              <Save size={16} />
              <span>Change Password</span>
            </button>
          </form>
        </div>

        {/* Database Config Section */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)]">
            <Database className="text-[var(--accent)]" size={22} />
            <h2 className="text-xl font-bold">Database Status</h2>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-[var(--bg-primary)]/40 border border-[var(--border)]">
            <div>
              <p className="font-technical text-xs text-[var(--text-secondary)] mb-1">
                DATABASE PROVIDER
              </p>
              <p className="font-semibold text-sm">PostgreSQL (Supabase)</p>
            </div>
            <div>
              <p className="font-technical text-xs text-[var(--text-secondary)] mb-1">
                CONNECTION STATUS
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-technical">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                ACTIVE
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
