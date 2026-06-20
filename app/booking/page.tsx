"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Camera, Send, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const eventTypes = [
  "Wedding",
  "Portrait Session",
  "Event Coverage",
  "Product Photography",
  "Fashion / Editorial",
  "Other",
];

export default function BookingPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    location: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking form submitted:", formData);
    setIsSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <CheckCircle className="w-16 h-16 mx-auto mb-6" style={{ color: "#A8D841" }} />
          <h2
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: "var(--font-outfit)", color: "var(--text-primary)" }}
          >
            Session Booked!
          </h2>
          <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-outfit)" }}>
            Thank you for your interest. I&apos;ll review your request and get
            back to you within 24 hours.
          </p>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-20" style={{ background: "var(--bg-primary)" }}>
      <div className="container-abi">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p
            className="font-technical tracking-[0.3em] mb-4"
            style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
          >
            ◈ BOOK A SESSION ◈
          </p>
          <h1
            className="font-bold mb-6"
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "var(--text-3xl)",
              color: "var(--text-primary)",
            }}
          >
            Let&apos;s Create <span style={{ color: "#E8632B" }}>Together</span>
          </h1>
          <p
            className="max-w-lg mx-auto"
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-outfit)",
              fontSize: "var(--text-base)",
            }}
          >
            Every great photograph begins with a conversation. Tell me about
            your vision, and let&apos;s bring it to life.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto space-y-6"
        >
          {/* Name + Email Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className="block mb-2 font-technical"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
              >
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border transition-all duration-300 outline-none",
                  "focus:border-[#E8632B] focus:shadow-[0_0_15px_rgba(232,99,43,0.2)]"
                )}
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-outfit)",
                }}
              />
            </div>
            <div>
              <label
                className="block mb-2 font-technical"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
              >
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border transition-all duration-300 outline-none",
                  "focus:border-[#E8632B] focus:shadow-[0_0_15px_rgba(232,99,43,0.2)]"
                )}
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-outfit)",
                }}
              />
            </div>
          </div>

          {/* Phone + Event Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className="block mb-2 font-technical"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border transition-all duration-300 outline-none",
                  "focus:border-[#E8632B] focus:shadow-[0_0_15px_rgba(232,99,43,0.2)]"
                )}
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-outfit)",
                }}
              />
            </div>
            <div>
              <label
                className="block mb-2 font-technical"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
              >
                Event Type *
              </label>
              <div className="relative">
                <Camera
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--text-muted)" }}
                />
                <select
                  name="eventType"
                  required
                  value={formData.eventType}
                  onChange={handleChange}
                  className={cn(
                    "w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-300 outline-none appearance-none",
                    "focus:border-[#E8632B] focus:shadow-[0_0_15px_rgba(232,99,43,0.2)]"
                  )}
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border)",
                    color: formData.eventType ? "var(--text-primary)" : "var(--text-muted)",
                    fontFamily: "var(--font-outfit)",
                  }}
                >
                  <option value="">Select type...</option>
                  {eventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Date + Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                className="block mb-2 font-technical"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
              >
                <Calendar className="inline-block w-3 h-3 mr-1 -mt-0.5" />
                Event Date *
              </label>
              <input
                type="date"
                name="eventDate"
                required
                value={formData.eventDate}
                onChange={handleChange}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border transition-all duration-300 outline-none",
                  "focus:border-[#E8632B] focus:shadow-[0_0_15px_rgba(232,99,43,0.2)]"
                )}
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-outfit)",
                  colorScheme: "dark",
                }}
              />
            </div>
            <div>
              <label
                className="block mb-2 font-technical"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
              >
                <MapPin className="inline-block w-3 h-3 mr-1 -mt-0.5" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Venue, or TBD"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border transition-all duration-300 outline-none",
                  "focus:border-[#E8632B] focus:shadow-[0_0_15px_rgba(232,99,43,0.2)]"
                )}
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-outfit)",
                }}
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label
              className="block mb-2 font-technical"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
            >
              Tell Me About Your Vision
            </label>
            <textarea
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              placeholder="Describe the mood, style, and details of your dream shoot..."
              className={cn(
                "w-full px-4 py-3 rounded-lg border transition-all duration-300 outline-none resize-none",
                "focus:border-[#E8632B] focus:shadow-[0_0_15px_rgba(232,99,43,0.2)]"
              )}
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-outfit)",
              }}
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(232, 99, 43, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #E8632B, #D4551F)",
              fontFamily: "var(--font-outfit)",
              fontSize: "var(--text-lg)",
            }}
          >
            <Send className="w-5 h-5" />
            Send Booking Request
          </motion.button>

          <p
            className="text-center text-sm"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
          >
            I typically respond within 24 hours
          </p>
        </motion.form>
      </div>
    </main>
  );
}
