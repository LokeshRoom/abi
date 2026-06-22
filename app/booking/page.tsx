"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Camera,
  Send,
  CheckCircle,
  User,
  Mail,
  Phone,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfettiBurst } from "@/components/ui/confetti-burst";

const EVENT_TYPES = [
  { label: "Wedding", icon: "💍", description: "Capture your special day" },
  { label: "Portrait Session", icon: "📸", description: "Individual or couple portraits" },
  { label: "Event Coverage", icon: "🎉", description: "Comprehensive event documentation" },
  { label: "Product Photography", icon: "📦", description: "Commercial product shoots" },
  { label: "Fashion / Editorial", icon: "👗", description: "Fashion-forward captures" },
  { label: "Other", icon: "✨", description: "Something unique" },
];

const STEPS = [
  { title: "Personal Info", subtitle: "Let's get to know you" },
  { title: "Session Details", subtitle: "Tell us about your event" },
  { title: "Your Vision", subtitle: "Describe your dream shoot" },
];

// Step indicator component
function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-12">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <motion.div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold",
              "transition-all duration-500"
            )}
            animate={{
              backgroundColor:
                i <= currentStep ? "#E8632B" : "var(--bg-card)",
              color: i <= currentStep ? "#0A0A0A" : "var(--text-muted)",
              boxShadow:
                i === currentStep
                  ? "0 0 20px rgba(232, 99, 43, 0.4)"
                  : "none",
              scale: i === currentStep ? 1.1 : 1,
            }}
            style={{
              border: `1px solid ${i <= currentStep ? "#E8632B" : "var(--border)"}`,
            }}
          >
            {i < currentStep ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              i + 1
            )}
          </motion.div>
          {i < totalSteps - 1 && (
            <motion.div
              className="h-px w-12 md:w-20"
              animate={{
                backgroundColor: i < currentStep ? "#E8632B" : "var(--border)",
              }}
              transition={{ duration: 0.5 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Animated checkmark SVG
function AnimatedCheckmark() {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="mx-auto mb-6 h-24 w-24"
    >
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#A8D841"
        strokeWidth="3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
      <motion.path
        d="M30 52 L44 66 L70 38"
        fill="none"
        stroke="#A8D841"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.5, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
  }),
};

export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    eventType: "",
    eventDate: "",
    location: "",
    message: "",
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit booking request");
      }

      setIsSubmitted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const goNext = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== "" && formData.email.trim() !== "";
      case 1:
        return formData.eventType !== "" && formData.eventDate !== "";
      case 2:
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const inputClasses = cn(
    "w-full px-4 py-3.5 rounded-xl transition-all duration-300 outline-none",
    "glass-card gradient-border",
    "focus:shadow-[0_0_20px_rgba(232,99,43,0.15)]"
  );

  const inputStyle = {
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    fontFamily: "var(--font-outfit)",
  };

  if (isSubmitted) {
    return (
      <main
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <ConfettiBurst active={showConfetti} />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mx-auto max-w-md px-6 text-center"
        >
          <AnimatedCheckmark />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-4 text-2xl font-bold"
            style={{
              fontFamily: "var(--font-outfit)",
              color: "var(--text-primary)",
            }}
          >
            Session Booked!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            style={{
              color: "var(--text-secondary)",
              fontFamily: "var(--font-outfit)",
            }}
          >
            Thank you for your interest. I&apos;ll review your request and get
            back to you within 24 hours.
          </motion.p>

          {/* Booking summary card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8 rounded-2xl p-6 text-left glass-card"
          >
            <h3
              className="font-technical mb-4 text-xs tracking-[0.15em]"
              style={{ color: "var(--accent)" }}
            >
              BOOKING SUMMARY
            </h3>
            <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              <p><span style={{ color: "var(--text-muted)" }}>Name:</span> {formData.name}</p>
              <p><span style={{ color: "var(--text-muted)" }}>Event:</span> {formData.eventType}</p>
              <p><span style={{ color: "var(--text-muted)" }}>Date:</span> {formData.eventDate}</p>
              {formData.location && (
                <p><span style={{ color: "var(--text-muted)" }}>Location:</span> {formData.location}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen pt-28 pb-20"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="container-abi">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <p
            className="font-technical mb-4 tracking-[0.3em]"
            style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
          >
            ◈ BOOK A SESSION ◈
          </p>
          <h1
            className="mb-6 font-bold"
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "var(--text-3xl)",
              color: "var(--text-primary)",
            }}
          >
            Let&apos;s Create{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #E8632B, #A8D841)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Together
            </span>
          </h1>
        </motion.div>

        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={3} />

        {/* Step title */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-8 text-center"
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {STEPS[currentStep].title}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {STEPS[currentStep].subtitle}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Form steps */}
        <div className="mx-auto max-w-2xl">
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-center text-sm text-red-500"
            >
              {submitError}
            </motion.div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 1: Personal Info */}
            {currentStep === 0 && (
              <motion.div
                key="step-0"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div>
                  <label className="mb-2 flex items-center gap-2 font-technical" style={{ color: "var(--text-secondary)" }}>
                    <User className="h-3 w-3" /> Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className={inputClasses}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 font-technical" style={{ color: "var(--text-secondary)" }}>
                    <Mail className="h-3 w-3" /> Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={inputClasses}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="mb-2 flex items-center gap-2 font-technical" style={{ color: "var(--text-secondary)" }}>
                    <Phone className="h-3 w-3" /> Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX"
                    className={inputClasses}
                    style={inputStyle}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2: Session Details */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                {/* Event type visual selector */}
                <div>
                  <label className="mb-4 flex items-center gap-2 font-technical" style={{ color: "var(--text-secondary)" }}>
                    <Camera className="h-3 w-3" /> Event Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {EVENT_TYPES.map((type) => (
                      <motion.button
                        key={type.label}
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, eventType: type.label }))
                        }
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl p-4 text-center cursor-pointer",
                          "transition-all duration-300",
                          formData.eventType === type.label
                            ? "shadow-[0_0_20px_rgba(232,99,43,0.3)]"
                            : "glass-card"
                        )}
                        style={{
                          backgroundColor:
                            formData.eventType === type.label
                              ? "rgba(232, 99, 43, 0.15)"
                              : undefined,
                          border: `1px solid ${
                            formData.eventType === type.label
                              ? "rgba(232, 99, 43, 0.5)"
                              : "rgba(255,255,255,0.06)"
                          }`,
                        }}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <span
                          className="text-xs font-semibold"
                          style={{
                            color:
                              formData.eventType === type.label
                                ? "#E8632B"
                                : "var(--text-primary)",
                          }}
                        >
                          {type.label}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {type.description}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-2 font-technical" style={{ color: "var(--text-secondary)" }}>
                      <Calendar className="h-3 w-3" /> Event Date *
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      required
                      value={formData.eventDate}
                      onChange={handleChange}
                      className={inputClasses}
                      style={{ ...inputStyle, colorScheme: "dark" }}
                    />
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 font-technical" style={{ color: "var(--text-secondary)" }}>
                      <MapPin className="h-3 w-3" /> Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Venue, or TBD"
                      className={inputClasses}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Your Vision */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div>
                  <label className="mb-2 flex items-center gap-2 font-technical" style={{ color: "var(--text-secondary)" }}>
                    <MessageSquare className="h-3 w-3" /> Tell Me About Your Vision
                  </label>
                  <textarea
                    name="message"
                    rows={7}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe the mood, style, and details of your dream shoot..."
                    className={cn(inputClasses, "resize-none")}
                    style={inputStyle}
                  />
                </div>

                {/* Preview summary */}
                <div className="rounded-2xl p-5 glass-card">
                  <h3
                    className="font-technical mb-3 text-[10px] tracking-[0.15em]"
                    style={{ color: "var(--accent)" }}
                  >
                    BOOKING PREVIEW
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Name:</span>{" "}
                      {formData.name}
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Email:</span>{" "}
                      {formData.email}
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Event:</span>{" "}
                      {formData.eventType}
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Date:</span>{" "}
                      {formData.eventDate}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="mt-10 flex items-center justify-between">
            {currentStep > 0 ? (
              <motion.button
                type="button"
                onClick={goPrev}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold glass-card cursor-pointer"
                style={{ color: "var(--text-secondary)" }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </motion.button>
            ) : (
              <div />
            )}

            {currentStep < 2 ? (
              <motion.button
                type="button"
                onClick={goNext}
                disabled={!canProceed()}
                whileHover={canProceed() ? { scale: 1.03, boxShadow: "0 0 30px rgba(232, 99, 43, 0.4)" } : {}}
                whileTap={canProceed() ? { scale: 0.97 } : {}}
                className="inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #E8632B, #D4551F)",
                  color: "#0A0A0A",
                }}
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                whileHover={!isSubmitting ? { scale: 1.03, boxShadow: "0 0 40px rgba(232, 99, 43, 0.4)" } : {}}
                whileTap={!isSubmitting ? { scale: 0.97 } : {}}
                className="inline-flex items-center gap-2 rounded-xl px-10 py-3.5 text-sm font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #E8632B, #D4551F)",
                  color: "#0A0A0A",
                }}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Send Booking Request"}
              </motion.button>
            )}
          </div>

          <p
            className="mt-6 text-center text-sm"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}
          >
            I typically respond within 24 hours
          </p>
        </div>
      </div>
    </main>
  );
}
