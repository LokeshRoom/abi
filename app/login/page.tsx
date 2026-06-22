"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      const session = await getSession();
      if (session?.user?.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push(callbackUrl === "/gallery" ? "/" : callbackUrl);
      }
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4 film-grain">
      <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle scanline overlay just for the login card */}
        <div className="absolute inset-0 scanline-effect pointer-events-none opacity-50" />
        
        <div className="relative z-10 text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--accent)] mb-2">Sign In</h1>
          <p className="text-[var(--text-muted)] font-technical text-sm tracking-widest">ABI PHOTO STUDIO</p>
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
            className="w-full bg-[var(--accent)] text-[var(--bg-primary)] font-bold rounded-lg px-4 py-3 hover:shadow-[0_0_20px_rgba(232,99,43,0.3)] transition-all disabled:opacity-70"
          >
            {loading ? "Authenticating..." : "Access Gallery"}
          </button>
        </form>
      </div>
    </div>
  );
}
