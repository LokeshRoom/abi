"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Shield, User, Mail, Lock, RefreshCw, CheckCircle, XCircle } from "lucide-react";

interface SettingsFormProps {
  initialName: string;
  initialEmail: string;
  role: "ADMIN" | "CLIENT";
}

export default function SettingsForm({ initialName, initialEmail, role }: SettingsFormProps) {
  const router = useRouter();

  // Form states
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate password confirmation
    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (!currentPassword) {
      setError("Current password is required to save changes");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          newEmail: email,
          newPassword: newPassword || undefined,
          currentPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update settings");
      }

      setSuccess("Your account settings have been updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");

      // Trigger router refresh to update server-side components (header, sidebar)
      router.refresh();

      // If email changed, tell user they might need to sign in again or reload
      if (email !== initialEmail) {
        setTimeout(() => {
          // Force page reload to ensure the new session state propagates everywhere
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 relative overflow-hidden">
      <div className="absolute inset-0 scanline-effect pointer-events-none opacity-20" />
      
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--border)] relative z-10">
        <Shield className="text-[var(--accent)]" size={22} />
        <h2 className="text-xl font-bold">
          {role === "ADMIN" ? "Admin Credentials" : "Account Settings"}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <XCircle size={18} className="shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle size={18} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{success}</p>
              {email !== initialEmail && (
                <p className="text-xs opacity-80 mt-1 font-technical">
                  EMAIL CHANGED. RELOADING SESSION...
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Name */}
          <div className="space-y-2">
            <label className="block text-xs font-technical text-[var(--text-secondary)] tracking-wider">
              FULL NAME
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)]">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--text-primary)]"
                placeholder="Name"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="block text-xs font-technical text-[var(--text-secondary)] tracking-wider">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)]">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--text-primary)]"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="block text-xs font-technical text-[var(--text-secondary)] tracking-wider">
              NEW PASSWORD (OPTIONAL)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)]">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--text-primary)]"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-xs font-technical text-[var(--text-secondary)] tracking-wider">
              CONFIRM NEW PASSWORD
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)]">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={!newPassword}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Current Password - REQUIRED FOR SECURITY */}
        <div className="border-t border-[var(--border)]/60 pt-6 space-y-2">
          <label className="block text-xs font-technical text-[var(--text-secondary)] tracking-wider flex items-center gap-1.5">
            <Shield size={13} className="text-[var(--accent)]" />
            CURRENT PASSWORD (REQUIRED TO SAVE CHANGES)
          </label>
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--text-muted)]">
              <Lock size={16} />
            </span>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--text-primary)]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-lg hover:shadow-[0_0_15px_var(--accent-glow)] transition-all cursor-pointer text-sm disabled:opacity-75"
        >
          {loading ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span>Save Account Settings</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
