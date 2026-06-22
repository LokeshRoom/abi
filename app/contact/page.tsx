"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/constants";
import { Send, CheckCircle, Mail, MapPin, Clock } from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    try {
      setSubmitError("");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to send message");
      }

      setIsSubmitted(true);
      reset();
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    }
  };

  const inputClasses = cn(
    "w-full rounded-xl px-4 py-3.5 text-sm outline-none",
    "transition-all duration-300",
    "glass-card gradient-border",
    "placeholder:text-[var(--text-muted)]",
    "focus:shadow-[0_0_20px_rgba(232,99,43,0.15)]"
  );

  return (
    <section
      className="pt-24 md:pt-28"
      style={{ paddingBottom: "var(--section-padding)" }}
    >
      <div className="container-abi">
        {/* ═══ Page heading ═══ */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
          <motion.div
            className="mx-auto mt-4 h-px w-16"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ background: "linear-gradient(90deg, transparent, var(--accent), transparent)" }}
          />
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          {/* ═══ Contact form ═══ */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl p-8 text-center glass-card"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                >
                  <CheckCircle className="mb-6 h-16 w-16 text-[#A8D841]" />
                </motion.div>
                <h3
                  className="mb-3 text-xl font-bold"
                  style={{ fontFamily: "var(--font-outfit)" }}
                >
                  Message Sent!
                </h3>
                <p
                  className="mb-8 max-w-sm text-sm"
                  style={{
                    color: "var(--text-secondary)",
                    fontFamily: "var(--font-outfit)",
                  }}
                >
                  Thank you for reaching out. I have received your message and
                  will respond within 24 hours.
                </p>
                <motion.button
                  onClick={() => setIsSubmitted(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-xl px-6 py-3 text-sm font-semibold transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(232,99,43,0.3)]"
                  style={{
                    backgroundColor: "var(--accent)",
                    color: "var(--bg-primary)",
                    fontFamily: "var(--font-outfit)",
                  }}
                >
                  Send Another Message
                </motion.button>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-6"
                noValidate
              >
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-center text-sm text-red-500"
                  >
                    {submitError}
                  </motion.div>
                )}

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
                    className={cn(inputClasses, errors.name && "border-red-500")}
                    style={{
                      backgroundColor: "var(--bg-card)",
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
                    className={cn(inputClasses, errors.email && "border-red-500")}
                    style={{
                      backgroundColor: "var(--bg-card)",
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
                    className={cn(inputClasses, errors.subject && "border-red-500")}
                    style={{
                      backgroundColor: "var(--bg-card)",
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
                      inputClasses,
                      "resize-none",
                      errors.message && "border-red-500"
                    )}
                    style={{
                      backgroundColor: "var(--bg-card)",
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
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={!isSubmitting ? { scale: 1.02, boxShadow: "0 0 30px rgba(232, 99, 43, 0.4)" } : {}}
                  whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                  className={cn(
                    "group relative inline-flex items-center justify-center gap-2 rounded-xl px-8 py-3.5",
                    "text-sm font-semibold tracking-wide",
                    "transition-all duration-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  )}
                  style={{
                    background: "linear-gradient(135deg, #E8632B, #D4551F)",
                    color: "#0A0A0A",
                  }}
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* ═══ Side panel ═══ */}
          <motion.div
            className="flex flex-col gap-6 lg:col-span-2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Contact info */}
            <div className="rounded-2xl p-6 glass-card">
              <h3
                className="font-technical mb-4 flex items-center gap-2 text-xs tracking-[0.15em]"
                style={{ color: "var(--text-primary)" }}
              >
                <Mail className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                CONTACT INFO
              </h3>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:abishekmass143@gmail.com"
                  className="text-sm transition-colors duration-[var(--transition-fast)] hover:text-[var(--accent)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  abishekmass143@gmail.com
                </a>
                <a
                  href="tel:+916369562031"
                  className="text-sm transition-colors duration-[var(--transition-fast)] hover:text-[var(--accent)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  +91 6369562031
                </a>
                <p
                  className="flex items-center gap-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <MapPin className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                  Shoolagiri, Tamil Nadu, India
                </p>
              </div>
            </div>

            {/* Social */}
            <motion.div
              className="rounded-2xl p-6 glass-card"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h3
                className="font-technical mb-4 flex items-center gap-2 text-xs tracking-[0.15em]"
                style={{ color: "var(--text-primary)" }}
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "var(--accent)" }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                FOLLOW ALONG
              </h3>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-3 rounded-xl px-4 py-3",
                  "text-sm transition-all duration-300",
                  "glass-card hover:scale-105"
                )}
                style={{ color: "var(--text-secondary)" }}
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
            </motion.div>

            {/* Response time */}
            <div className="rounded-2xl p-6 glass-card">
              <h3
                className="font-technical mb-4 flex items-center gap-2 text-xs tracking-[0.15em]"
                style={{ color: "var(--text-primary)" }}
              >
                <Clock className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}
