export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="flex flex-col items-center gap-4">
        {/* ═══ Pulsing wordmark ═══ */}
        <div className="pulse-glow rounded-xl px-6 py-4">
          <span
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: "var(--accent)" }}
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
