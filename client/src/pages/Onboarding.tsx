import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

// ─── Design tokens (match global brand) ──────────────────────────────────────
const BG = "oklch(0.09 0.008 60)";
const SURFACE = "oklch(0.12 0.007 60)";
const SURFACE_RAISED = "oklch(0.14 0.007 60)";
const BORDER = "oklch(0.22 0.007 60)";
const BORDER_ACCENT = "oklch(0.88 0.025 85 / 0.35)";
const IVORY = "oklch(0.88 0.025 85)";
const IVORY_DIM = "oklch(0.88 0.025 85 / 0.55)";
const FOREGROUND = "oklch(0.93 0.010 80)";
const MUTED = "oklch(0.62 0.006 80)";
const AMBER = "oklch(0.78 0.14 65)";
const FONT_DISPLAY = "Cormorant Garamond, Georgia, serif";
const FONT_MONO = "JetBrains Mono, monospace";
const FONT_SANS = "Inter, sans-serif";

const TOTAL_STEPS = 5;

// ─── Step data ────────────────────────────────────────────────────────────────
const CURRENT_TOOL_OPTIONS = [
  { value: "nothing", label: "Nothing yet" },
  { value: "manual_outreach", label: "Manual outreach" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "another_tool", label: "Another tool" },
  { value: "agency", label: "Agency / freelancer" },
  { value: "other", label: "Other" },
];

const PAIN_POINT_OPTIONS = [
  { value: "finding_quality_leads", label: "Finding quality leads consistently" },
  { value: "writing_messages", label: "Writing messages that get replies" },
  { value: "low_response_rates", label: "Low response rates" },
  { value: "too_much_time", label: "Spending too much time manually searching" },
  { value: "not_knowing_what_to_say", label: "Not knowing what to say" },
  { value: "too_complex", label: "Tools are too complex" },
  { value: "inconsistent_results", label: "Inconsistent results" },
  { value: "getting_ignored", label: "Getting ignored / no engagement" },
  { value: "scaling_outreach", label: "Scaling outreach" },
  { value: "other", label: "Other" },
];

// ─── Shared input styles ──────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  background: SURFACE,
  border: `0.5px solid ${BORDER}`,
  color: FOREGROUND,
  fontFamily: FONT_SANS,
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: "80px",
  lineHeight: 1.6,
};

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  const pct = Math.round(((step - 1) / TOTAL_STEPS) * 100);
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED }}>
          Step {step} of {TOTAL_STEPS}
        </span>
        <span style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.12em", color: MUTED }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: "2px", background: BORDER, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${Math.round((step / TOTAL_STEPS) * 100)}%`,
            background: IVORY,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Step 1: Name + Email (prefilled) ─────────────────────────────────────────
function Step1({
  name,
  email,
  onNext,
}: {
  name: string;
  email: string;
  onNext: () => void;
}) {
  return (
    <div>
      <p className="eyebrow mb-3" style={{ color: IVORY_DIM }}>Let's personalise your experience</p>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 300, fontStyle: "italic", color: FOREGROUND, lineHeight: 1.15, marginBottom: "0.5rem" }}>
        Welcome to SubRoast.
      </h1>
      <p style={{ fontFamily: FONT_SANS, fontSize: "0.875rem", color: MUTED, lineHeight: 1.7, marginBottom: "2rem" }}>
        Quick setup — takes about 30 seconds. We'll use this to personalise your experience.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <label style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "0.4rem" }}>
            Name
          </label>
          <input
            value={name}
            readOnly
            style={{ ...inputStyle, opacity: 0.7 }}
          />
        </div>
        <div>
          <label style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "0.4rem" }}>
            Email
          </label>
          <input
            value={email || "—"}
            readOnly
            style={{ ...inputStyle, opacity: 0.7 }}
          />
        </div>
      </div>

      <button onClick={onNext} style={ctaStyle}>
        Continue →
      </button>
    </div>
  );
}

// ─── Step 2: Current tool ─────────────────────────────────────────────────────
function Step2({
  value,
  otherValue,
  onChange,
  onOtherChange,
  onNext,
  onBack,
}: {
  value: string;
  otherValue: string;
  onChange: (v: string) => void;
  onOtherChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <p className="eyebrow mb-3" style={{ color: IVORY_DIM }}>Current workflow</p>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 300, fontStyle: "italic", color: FOREGROUND, lineHeight: 1.2, marginBottom: "0.5rem" }}>
        What are you using today for outreach?
      </h2>
      <p style={{ fontFamily: FONT_SANS, fontSize: "0.875rem", color: MUTED, lineHeight: 1.7, marginBottom: "1.75rem" }}>
        Pick the option that best describes your current setup.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {CURRENT_TOOL_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: "0.75rem 1rem",
              background: value === opt.value ? SURFACE_RAISED : SURFACE,
              border: `0.5px solid ${value === opt.value ? IVORY : BORDER}`,
              color: value === opt.value ? IVORY : FOREGROUND,
              fontFamily: FONT_SANS,
              fontSize: "0.875rem",
              textAlign: "left",
              cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span style={{
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              border: `1.5px solid ${value === opt.value ? IVORY : BORDER}`,
              background: value === opt.value ? IVORY : "transparent",
              flexShrink: 0,
              display: "inline-block",
            }} />
            {opt.label}
          </button>
        ))}
      </div>

      {value === "other" && (
        <input
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Tell us what you use…"
          style={{ ...inputStyle, marginBottom: "1.25rem" }}
        />
      )}

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button onClick={onBack} style={backStyle}>← Back</button>
        <button onClick={onNext} disabled={!value} style={{ ...ctaStyle, flex: 1, opacity: value ? 1 : 0.4 }}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Pain points ──────────────────────────────────────────────────────
function Step3({
  selected,
  otherValue,
  onToggle,
  onOtherChange,
  onNext,
  onBack,
}: {
  selected: string[];
  otherValue: string;
  onToggle: (v: string) => void;
  onOtherChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <p className="eyebrow mb-3" style={{ color: IVORY_DIM }}>Pain points</p>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 300, fontStyle: "italic", color: FOREGROUND, lineHeight: 1.2, marginBottom: "0.5rem" }}>
        What's most frustrating about your current setup?
      </h2>
      <p style={{ fontFamily: FONT_SANS, fontSize: "0.875rem", color: MUTED, lineHeight: 1.7, marginBottom: "1.75rem" }}>
        Select all that apply.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {PAIN_POINT_OPTIONS.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              onClick={() => onToggle(opt.value)}
              style={{
                padding: "0.75rem 1rem",
                background: active ? SURFACE_RAISED : SURFACE,
                border: `0.5px solid ${active ? IVORY : BORDER}`,
                color: active ? IVORY : FOREGROUND,
                fontFamily: FONT_SANS,
                fontSize: "0.875rem",
                textAlign: "left",
                cursor: "pointer",
                transition: "border-color 0.2s, color 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <span style={{
                width: "14px",
                height: "14px",
                border: `1.5px solid ${active ? IVORY : BORDER}`,
                background: active ? IVORY : "transparent",
                flexShrink: 0,
                display: "inline-block",
              }} />
              {opt.label}
            </button>
          );
        })}
      </div>

      {selected.includes("other") && (
        <input
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Describe your frustration…"
          style={{ ...inputStyle, marginBottom: "1.25rem" }}
        />
      )}

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button onClick={onBack} style={backStyle}>← Back</button>
        <button onClick={onNext} disabled={selected.length === 0} style={{ ...ctaStyle, flex: 1, opacity: selected.length > 0 ? 1 : 0.4 }}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Success definition ───────────────────────────────────────────────
function Step4({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <p className="eyebrow mb-3" style={{ color: IVORY_DIM }}>Your goal</p>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 300, fontStyle: "italic", color: FOREGROUND, lineHeight: 1.2, marginBottom: "0.5rem" }}>
        What does success look like for you?
      </h2>
      <p style={{ fontFamily: FONT_SANS, fontSize: "0.875rem", color: MUTED, lineHeight: 1.7, marginBottom: "1.75rem" }}>
        In one sentence — what would make SubRoast a win for you?
      </p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Getting 5 warm leads per week without spending hours on Reddit…"
        style={{ ...textareaStyle, marginBottom: "1.5rem" }}
      />

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button onClick={onBack} style={backStyle}>← Back</button>
        <button onClick={onNext} disabled={!value.trim()} style={{ ...ctaStyle, flex: 1, opacity: value.trim() ? 1 : 0.4 }}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 5: Willingness to pay + notes ──────────────────────────────────────
function Step5({
  wtp,
  notes,
  onWtpChange,
  onNotesChange,
  onSubmit,
  onBack,
  isLoading,
}: {
  wtp: "yes" | "maybe" | "no" | "";
  notes: string;
  onWtpChange: (v: "yes" | "maybe" | "no") => void;
  onNotesChange: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const WTP_OPTIONS: { value: "yes" | "maybe" | "no"; label: string }[] = [
    { value: "yes", label: "Yes" },
    { value: "maybe", label: "Maybe" },
    { value: "no", label: "No" },
  ];

  return (
    <div>
      <p className="eyebrow mb-3" style={{ color: IVORY_DIM }}>Almost done</p>
      <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "clamp(1.5rem, 3.5vw, 2rem)", fontWeight: 300, fontStyle: "italic", color: FOREGROUND, lineHeight: 1.2, marginBottom: "0.5rem" }}>
        One last question.
      </h2>
      <p style={{ fontFamily: FONT_SANS, fontSize: "0.875rem", color: MUTED, lineHeight: 1.7, marginBottom: "1.75rem" }}>
        If SubRoast consistently helped you get leads or replies, would you pay ~$39/month for it?
      </p>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {WTP_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onWtpChange(opt.value)}
            style={{
              flex: 1,
              padding: "0.85rem 1rem",
              background: wtp === opt.value ? SURFACE_RAISED : SURFACE,
              border: `0.5px solid ${wtp === opt.value ? IVORY : BORDER}`,
              color: wtp === opt.value ? IVORY : FOREGROUND,
              fontFamily: FONT_MONO,
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: "1.75rem" }}>
        <label style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED, display: "block", marginBottom: "0.4rem" }}>
          Anything else? (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Feature requests, concerns, or anything on your mind…"
          style={{ ...textareaStyle }}
        />
      </div>

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button onClick={onBack} style={backStyle}>← Back</button>
        <button
          onClick={onSubmit}
          disabled={!wtp || isLoading}
          style={{ ...ctaStyle, flex: 1, opacity: wtp && !isLoading ? 1 : 0.4 }}
        >
          {isLoading ? "Saving…" : "Go to my dashboard →"}
        </button>
      </div>
    </div>
  );
}

// ─── Button styles ────────────────────────────────────────────────────────────
const ctaStyle: React.CSSProperties = {
  padding: "0.85rem 1.5rem",
  background: IVORY,
  border: `0.5px solid ${IVORY}`,
  color: BG,
  fontFamily: FONT_MONO,
  fontSize: "0.68rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "opacity 0.2s",
  width: "100%",
};

const backStyle: React.CSSProperties = {
  padding: "0.85rem 1rem",
  background: "transparent",
  border: `0.5px solid ${BORDER}`,
  color: MUTED,
  fontFamily: FONT_MONO,
  fontSize: "0.65rem",
  letterSpacing: "0.15em",
  textTransform: "uppercase",
  cursor: "pointer",
  flexShrink: 0,
};

// ─── Main Onboarding page ─────────────────────────────────────────────────────
export default function Onboarding() {
  const [, navigate] = useLocation();
  const { user, loading } = useAuth();

  const [step, setStep] = useState(1);
  const [currentTool, setCurrentTool] = useState("");
  const [currentToolOther, setCurrentToolOther] = useState("");
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [painPointsOther, setPainPointsOther] = useState("");
  const [successDefinition, setSuccessDefinition] = useState("");
  const [willingnessToPay, setWillingnessToPay] = useState<"yes" | "maybe" | "no" | "">("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Load existing progress
  const { data: qualStatus } = trpc.onboarding.getQualificationStatus.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (!qualStatus) return;
    // Already completed → go to dashboard
    if (qualStatus.completed) {
      navigate("/dashboard");
      return;
    }
    // Resume from last saved step
    const savedStep = qualStatus.step ?? 0;
    if (savedStep >= 1) setStep(Math.max(savedStep, 1));
    const d = qualStatus.data;
    if (d) {
      if (d.currentTool) setCurrentTool(d.currentTool);
      if (d.currentToolOther) setCurrentToolOther(d.currentToolOther);
      if (d.painPoints?.length) setPainPoints(d.painPoints);
      if (d.painPointsOther) setPainPointsOther(d.painPointsOther);
      if (d.successDefinition) setSuccessDefinition(d.successDefinition);
      if (d.willingnessToPay) setWillingnessToPay(d.willingnessToPay);
      if (d.additionalNotes) setAdditionalNotes(d.additionalNotes);
    }
  }, [qualStatus, navigate]);

  const saveStep = trpc.onboarding.saveStep.useMutation();
  const complete = trpc.onboarding.complete.useMutation({
    onSuccess: () => navigate("/dashboard"),
  });

  const handleNext = async (nextStep: number, payload?: Parameters<typeof saveStep.mutate>[0]) => {
    if (payload) {
      await saveStep.mutateAsync(payload);
    }
    setStep(nextStep);
  };

  const handleSubmit = () => {
    if (!willingnessToPay) return;
    complete.mutate({
      currentTool,
      currentToolOther: currentToolOther || undefined,
      painPoints,
      painPointsOther: painPointsOther || undefined,
      successDefinition,
      willingnessToPay,
      additionalNotes: additionalNotes || undefined,
    });
  };

  const togglePainPoint = (v: string) => {
    setPainPoints((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  // Auth guard
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", color: MUTED, letterSpacing: "0.18em", textTransform: "uppercase" }}>Loading…</span>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl("/onboarding");
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: SURFACE,
          border: `0.5px solid ${BORDER}`,
          padding: "clamp(1.75rem, 5vw, 3rem)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663208942813/D6eMQgvSZZr9tsyS9zVhzn/subroast-logo-debossed_490a86ef.png" alt="SubRoast" style={{ width: "28px", height: "28px", objectFit: "contain" }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", color: IVORY }}>SubRoast</span>
        </div>

        <ProgressBar step={step} />

        {step === 1 && (
          <Step1
            name={user.name ?? ""}
            email={user.email ?? ""}
            onNext={() => handleNext(2, { step: 1 })}
          />
        )}
        {step === 2 && (
          <Step2
            value={currentTool}
            otherValue={currentToolOther}
            onChange={setCurrentTool}
            onOtherChange={setCurrentToolOther}
            onNext={() =>
              handleNext(3, {
                step: 2,
                currentTool,
                currentToolOther: currentToolOther || undefined,
              })
            }
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <Step3
            selected={painPoints}
            otherValue={painPointsOther}
            onToggle={togglePainPoint}
            onOtherChange={setPainPointsOther}
            onNext={() =>
              handleNext(4, {
                step: 3,
                painPoints,
                painPointsOther: painPointsOther || undefined,
              })
            }
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <Step4
            value={successDefinition}
            onChange={setSuccessDefinition}
            onNext={() =>
              handleNext(5, {
                step: 4,
                successDefinition,
              })
            }
            onBack={() => setStep(3)}
          />
        )}
        {step === 5 && (
          <Step5
            wtp={willingnessToPay}
            notes={additionalNotes}
            onWtpChange={setWillingnessToPay}
            onNotesChange={setAdditionalNotes}
            onSubmit={handleSubmit}
            onBack={() => setStep(4)}
            isLoading={complete.isPending}
          />
        )}
      </div>
    </div>
  );
}
