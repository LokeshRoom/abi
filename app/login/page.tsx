"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSafeCallbackUrl = (url: string) => {
    return url.startsWith("/") && !url.startsWith("//");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password");
        setLoading(false);
      } else {
        router.refresh();
        if (data.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          const target = isSafeCallbackUrl(callbackUrl) && callbackUrl !== "/admin/dashboard" 
            ? callbackUrl 
            : "/gallery";
          router.push(target);
        }
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4 film-grain">
      <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle scanline overlay just for the login card */}
        <div className="absolute inset-0 scanline-effect pointer-events-none opacity-50" />
        
        <div className="relative z-10 text-center mb-8 flex flex-col items-center">
          {/* Studio Brand Wordmark */}
          <Link href="/" className="group flex flex-col items-center mb-6">
            <span
              className="text-3xl font-extrabold leading-none tracking-tight bg-gradient-to-r from-[#E8632B] via-[#FAFAFA] to-[#A8D841] bg-clip-text text-transparent transition-all duration-[var(--transition-base)] group-hover:drop-shadow-[0_0_12px_rgba(232,99,43,0.4)]"
            >
              Abi
            </span>
            <span
              className="font-technical text-[9px] leading-none tracking-[0.2em] mt-1 text-[var(--text-muted)]"
            >
              PHOTO STUDIO
            </span>
          </Link>
          
          <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">Access Studio Portal</h1>
          <p className="text-xs text-[var(--text-muted)]">Sign in to manage bookings or view client proofs</p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="client@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-lg px-4 py-3 hover:shadow-[0_0_20px_rgba(232,99,43,0.3)] cursor-pointer transition-all disabled:opacity-70"
          >
            {loading ? "Authenticating..." : "Access Portal"}
          </button>
        </form>

        {/* Back to Home Link */}
        <div className="relative z-10 mt-6 pt-6 border-t border-[var(--border)] text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors group"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
