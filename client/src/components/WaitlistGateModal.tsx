import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

/* ── Types ── */
type Stage = "form" | "submitting" | "approved";

interface WaitlistGateModalProps {
  open: boolean;
  onClose: () => void;
}

/* ── Confetti burst (pure CSS, no deps) ── */
function ConfettiBurst() {
  const colors = [
    "oklch(0.88 0.025 85)",   // gold
    "oklch(0.75 0.12 145)",   // green
    "oklch(0.72 0.15 30)",    // orange
    "oklch(0.65 0.18 280)",   // purple
    "oklch(0.80 0.10 200)",   // teal
  ];
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    angle: (i / 24) * 360,
    distance: 40 + Math.random() * 60,
    size: 4 + Math.random() * 4,
    delay: Math.random() * 0.3,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            animation: `confettiBurst 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${p.delay}s both`,
            "--angle": `${p.angle}deg`,
            "--dist": `${p.distance}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ── Main Modal ── */
export default function WaitlistGateModal({ open, onClose }: WaitlistGateModalProps) {
  const [stage, setStage] = useState<Stage>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  const joinMutation = trpc.waitlist.join.useMutation({
    onSuccess: () => {
      setStage("approved");
    },
    onError: (err) => {
      setError(err.message || "Something went wrong. Please try again.");
      setStage("form");
    },
  });

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStage("form");
      setName("");
      setEmail("");
      setError("");
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setError("");
    setStage("submitting");
    joinMutation.mutate({ name: name.trim(), email: email.trim(), source: "home_modal" });
  };

  if (!open) return null;

  return (
    <>
      {/* Inject confetti keyframe once */}
      <style>{`
        @keyframes confettiBurst {
          from { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(1); opacity: 1; }
          to   { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--dist)) scale(0); opacity: 0; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes approvedIn {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "oklch(0.05 0.005 60 / 0.85)",
          backdropFilter: "blur(8px)",
          zIndex: 9998,
          animation: "fadeIn 0.25s ease both",
        }}
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Join the waitlist"
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem",
          pointerEvents: "none",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            pointerEvents: "auto",
            background: "oklch(0.11 0.008 60)",
            border: "0.5px solid oklch(0.22 0.007 60)",
            width: "100%",
            maxWidth: "420px",
            padding: "2rem 1.25rem",
            position: "relative",
            animation: "modalSlideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "oklch(0.45 0 0)",
              fontSize: "1.25rem",
              lineHeight: 1,
              padding: "0.25rem",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "oklch(0.88 0.025 85)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "oklch(0.45 0 0)")}
          >
            ×
          </button>

          {/* ── FORM STAGE ── */}
          {(stage === "form" || stage === "submitting") && (
            <div>
              {/* Eyebrow */}
              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "oklch(0.88 0.025 85)",
                marginBottom: "1rem",
              }}>
                Early access
              </p>

              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                fontWeight: 400,
                fontStyle: "italic",
                color: "oklch(0.93 0.010 80)",
                lineHeight: 1.2,
                marginBottom: "0.5rem",
              }}>
                Your next customer<br />is already on Reddit.
              </h2>

              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 300,
                color: "oklch(0.55 0.006 80)",
                lineHeight: 1.6,
                marginBottom: "1.75rem",
              }}>
                Join the waitlist and we'll let you know the moment your spot opens up.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={stage === "submitting"}
                  style={{
                    width: "100%",
                    background: "oklch(0.14 0.007 60)",
                    border: "0.5px solid oklch(0.25 0.007 60)",
                    color: "oklch(0.93 0.010 80)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    fontWeight: 300,
                    padding: "0.75rem 1rem",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "oklch(0.88 0.025 85 / 0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "oklch(0.25 0.007 60)")}
                />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={stage === "submitting"}
                  style={{
                    width: "100%",
                    background: "oklch(0.14 0.007 60)",
                    border: "0.5px solid oklch(0.25 0.007 60)",
                    color: "oklch(0.93 0.010 80)",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.9rem",
                    fontWeight: 300,
                    padding: "0.75rem 1rem",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "oklch(0.88 0.025 85 / 0.5)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "oklch(0.25 0.007 60)")}
                />

                {error && (
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "oklch(0.65 0.18 25)", letterSpacing: "0.08em" }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={stage === "submitting" || !name.trim() || !email.trim()}
                  style={{
                    width: "100%",
                    background: "oklch(0.88 0.025 85)",
                    color: "oklch(0.09 0.008 60)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.62rem",
                    fontWeight: 500,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    padding: "0.875rem 1.5rem",
                    border: "none",
                    cursor: stage === "submitting" ? "wait" : "pointer",
                    opacity: stage === "submitting" || !name.trim() || !email.trim() ? 0.6 : 1,
                    transition: "opacity 0.2s ease",
                    marginTop: "0.25rem",
                  }}
                >
                  {stage === "submitting" ? "Requesting access…" : "Request early access"}
                </button>
              </form>

              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                color: "oklch(0.40 0 0)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                textAlign: "center",
                marginTop: "1rem",
              }}>
                Free to join · No spam · Unsubscribe any time
              </p>
            </div>
          )}

          {/* ── APPROVED STAGE ── */}
          {stage === "approved" && (
            <div
              style={{
                textAlign: "center",
                animation: "approvedIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
                position: "relative",
              }}
            >
              <ConfettiBurst />

              {/* Animated check circle */}
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "oklch(0.88 0.025 85 / 0.12)",
                border: "1.5px solid oklch(0.88 0.025 85 / 0.6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="oklch(0.88 0.025 85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline
                    points="20 6 9 17 4 12"
                    style={{
                      strokeDasharray: 40,
                      strokeDashoffset: 0,
                      animation: "checkDraw 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both",
                    }}
                  />
                </svg>
              </div>

              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "oklch(0.88 0.025 85)",
                marginBottom: "0.75rem",
              }}>
                You're approved 🎉
              </p>

              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.4rem, 4vw, 1.9rem)",
                fontWeight: 400,
                fontStyle: "italic",
                color: "oklch(0.93 0.010 80)",
                lineHeight: 1.25,
                marginBottom: "0.75rem",
              }}>
                Start finding leads<br />on Reddit today.
              </h2>

              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: 300,
                color: "oklch(0.55 0.006 80)",
                lineHeight: 1.6,
                marginBottom: "1.75rem",
                maxWidth: "30ch",
                marginLeft: "auto",
                marginRight: "auto",
              }}>
                Your spot is reserved. Create your account and start finding leads on Reddit today.
              </p>

              <a
                href={getLoginUrl()}
                style={{
                  display: "block",
                  width: "100%",
                  background: "oklch(0.88 0.025 85)",
                  color: "oklch(0.09 0.008 60)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  fontWeight: 500,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  padding: "0.875rem 1.5rem",
                  textAlign: "center",
                  textDecoration: "none",
                  transition: "opacity 0.2s ease",
                  marginBottom: "0.75rem",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
              >
                Get started free →
              </a>

              <p style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                color: "oklch(0.40 0 0)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}>
                No credit card required · Cancel any time
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
