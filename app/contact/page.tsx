"use client";

import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = (data: ContactFormData) => {
    console.log("Contact form submitted:", data);
    reset();
  };

  return (
    <section className="pt-24 md:pt-28" style={{ paddingBottom: "var(--section-padding)" }}>
      <div className="container-abi">
        {/* ═══ Page heading ═══ */}
        <div className="mb-12 text-center">
          <h1
            className="font-technical text-lg tracking-[0.3em]"
            style={{ color: "var(--accent)" }}
          >
            GET IN TOUCH
          </h1>
          <p
            className="mt-3 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Let&apos;s discuss your vision and create something extraordinary
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          {/* ═══ Contact form ═══ */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-6"
              noValidate
            >
              {/* Name */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="font-technical text-xs tracking-[0.1em]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  NAME
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  className={cn(
                    "rounded-lg border px-4 py-3 text-sm outline-none",
                    "transition-all duration-[var(--transition-base)]",
                    "placeholder:text-[var(--text-muted)]",
                    "focus:border-[var(--accent)] focus:shadow-[0_0_15px_var(--accent-glow)]",
                    errors.name && "border-red-500"
                  )}
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: errors.name ? undefined : "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  {...register("name", { required: "Name is required" })}
                />
                {errors.name && (
                  <span className="text-xs text-red-400">
                    {errors.name.message}
                  </span>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="font-technical text-xs tracking-[0.1em]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  EMAIL
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className={cn(
                    "rounded-lg border px-4 py-3 text-sm outline-none",
                    "transition-all duration-[var(--transition-base)]",
                    "placeholder:text-[var(--text-muted)]",
                    "focus:border-[var(--accent)] focus:shadow-[0_0_15px_var(--accent-glow)]",
                    errors.email && "border-red-500"
                  )}
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: errors.email ? undefined : "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Please enter a valid email",
                    },
                  })}
                />
                {errors.email && (
                  <span className="text-xs text-red-400">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="subject"
                  className="font-technical text-xs tracking-[0.1em]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  SUBJECT
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="What's this about?"
                  className={cn(
                    "rounded-lg border px-4 py-3 text-sm outline-none",
                    "transition-all duration-[var(--transition-base)]",
                    "placeholder:text-[var(--text-muted)]",
                    "focus:border-[var(--accent)] focus:shadow-[0_0_15px_var(--accent-glow)]",
                    errors.subject && "border-red-500"
                  )}
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: errors.subject ? undefined : "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  {...register("subject", {
                    required: "Subject is required",
                  })}
                />
                {errors.subject && (
                  <span className="text-xs text-red-400">
                    {errors.subject.message}
                  </span>
                )}
              </div>

              {/* Message */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="message"
                  className="font-technical text-xs tracking-[0.1em]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  MESSAGE
                </label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="Tell me about your project or vision..."
                  className={cn(
                    "resize-none rounded-lg border px-4 py-3 text-sm outline-none",
                    "transition-all duration-[var(--transition-base)]",
                    "placeholder:text-[var(--text-muted)]",
                    "focus:border-[var(--accent)] focus:shadow-[0_0_15px_var(--accent-glow)]",
                    errors.message && "border-red-500"
                  )}
                  style={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: errors.message ? undefined : "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  {...register("message", {
                    required: "Message is required",
                    minLength: {
                      value: 10,
                      message: "Please write at least 10 characters",
                    },
                  })}
                />
                {errors.message && (
                  <span className="text-xs text-red-400">
                    {errors.message.message}
                  </span>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "group relative inline-flex items-center justify-center gap-2 rounded-lg px-8 py-3",
                  "text-sm font-semibold tracking-wide",
                  "transition-all duration-[var(--transition-base)]",
                  "hover:shadow-[0_0_30px_rgba(232,99,43,0.3)]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--bg-primary)",
                }}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
                <span className="inline-block transition-transform duration-[var(--transition-base)] group-hover:translate-x-1">
                  →
                </span>
              </button>
            </form>
          </div>

          {/* ═══ Side panel ═══ */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* Contact info */}
            <div
              className="rounded-xl border p-6"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              <h3
                className="font-technical mb-4 text-xs tracking-[0.15em]"
                style={{ color: "var(--text-primary)" }}
              >
                CONTACT INFO
              </h3>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:hello@abiphotostudio.com"
                  className="text-sm transition-colors duration-[var(--transition-fast)] hover:text-[var(--accent)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  hello@abiphotostudio.com
                </a>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Chennai, Tamil Nadu, India
                </p>
              </div>
            </div>

            {/* Social */}
            <div
              className="rounded-xl border p-6"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              <h3
                className="font-technical mb-4 text-xs tracking-[0.15em]"
                style={{ color: "var(--text-primary)" }}
              >
                FOLLOW ALONG
              </h3>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-3 rounded-lg border px-4 py-3",
                  "text-sm transition-all duration-[var(--transition-base)]",
                  "hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]"
                )}
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                @abishek__.004
              </a>
            </div>

            {/* Response time */}
            <div
              className="rounded-xl border p-6"
              style={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border)",
              }}
            >
              <h3
                className="font-technical mb-4 text-xs tracking-[0.15em]"
                style={{ color: "var(--text-primary)" }}
              >
                RESPONSE TIME
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                I typically respond within 24 hours. For urgent inquiries,
                reach out via Instagram DM.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
