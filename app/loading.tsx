export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* ═══ Aperture-style loading animation ═══ */}
        <div className="relative h-20 w-20">
          {/* Rotating ring */}
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              border: "2px solid transparent",
              borderTopColor: "#E8632B",
              borderRightColor: "rgba(232, 99, 43, 0.3)",
              animationDuration: "1.2s",
            }}
          />
          {/* Inner ring */}
          <div
            className="absolute inset-2 rounded-full animate-spin"
            style={{
              border: "2px solid transparent",
              borderBottomColor: "#A8D841",
              borderLeftColor: "rgba(168, 216, 65, 0.3)",
              animationDuration: "0.8s",
              animationDirection: "reverse",
            }}
          />
          {/* Center dot */}
          <div
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="h-2 w-2 rounded-full pulse-glow"
              style={{ backgroundColor: "#E8632B" }}
            />
          </div>
        </div>

        {/* ═══ Brand name ═══ */}
        <div className="text-center">
          <span
            className="text-2xl font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #E8632B, #FAFAFA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Abi
          </span>
        </div>

        <span
          className="font-technical text-[10px] tracking-[0.3em]"
          style={{ color: "var(--text-muted)" }}
        >
          LOADING
        </span>
      </div>
    </div>
  );
}
