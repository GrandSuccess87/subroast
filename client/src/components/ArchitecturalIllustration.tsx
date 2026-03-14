/**
 * ArchitecturalIllustration
 * Precision schematic: Reddit post → AI analysis → DM campaign
 * resolving into a stylized dashboard preview (lead card + spam badge + spider graph)
 *
 * Animated: connector lines and structural elements draw in via stroke-dashoffset
 * when the SVG scrolls into view (IntersectionObserver).
 */
import { useEffect, useRef, useState } from "react";

export function ArchitecturalIllustration() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Spider graph axes: 5 metrics
  const AXES = ["Clarity", "Fit", "Virality", "Spam\nRisk", "Urgency"];
  const SCORES = [0.82, 0.91, 0.74, 0.18, 0.88];
  const cx = 220, cy = 340, r = 68;

  function polarPoint(angle: number, radius: number) {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const axisAngles = AXES.map((_, i) => (360 / AXES.length) * i);
  const scorePoints = SCORES.map((s, i) => polarPoint(axisAngles[i], s * r));
  const scorePath =
    scorePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  const rings = [0.25, 0.5, 0.75, 1.0];

  // Helper: animated line props — draws in from dashoffset=length to 0
  function animLine(length: number, delay: number, duration = 0.9) {
    return {
      strokeDasharray: length,
      strokeDashoffset: visible ? 0 : length,
      style: {
        transition: visible
          ? `stroke-dashoffset ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
          : "none",
      },
    };
  }

  // Helper: animated path (for spider polygon)
  function animPath(length: number, delay: number, duration = 1.1) {
    return {
      strokeDasharray: length,
      strokeDashoffset: visible ? 0 : length,
      style: {
        transition: visible
          ? `stroke-dashoffset ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`
          : "none",
      },
    };
  }

  // Fade-in style for elements that appear (not draw)
  function animFade(delay: number, duration = 0.7) {
    return {
      style: {
        opacity: visible ? 1 : 0,
        transition: visible ? `opacity ${duration}s ease ${delay}s` : "none",
      },
    };
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 780 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-label="SubRoast product flow: Reddit post to AI analysis to DM campaign"
      role="img"
    >
      <defs>
        <linearGradient id="connectorGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.88 0.025 85)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="oklch(0.88 0.025 85)" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="connectorGrad2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.88 0.025 85)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="oklch(0.88 0.025 85)" stopOpacity="0.7" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="oklch(0.88 0.025 85)" strokeWidth="0.3" strokeOpacity="0.06" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="780" height="520" fill="oklch(0.10 0.007 60)" />
      <rect width="780" height="520" fill="url(#grid)" />

      {/* Ambient glow */}
      <ellipse cx="530" cy="210" rx="200" ry="140" fill="oklch(0.88 0.025 85)" fillOpacity="0.03" />

      {/* ── Corner marks — draw in first (delay 0) ── */}
      {([[0,0],[780,0],[0,520],[780,520]] as [number,number][]).map(([x, y], i) => {
        const dx = x === 0 ? 1 : -1, dy = y === 0 ? 1 : -1;
        return (
          <g key={i}>
            <line x1={x + dx * 8} y1={y} x2={x} y2={y} stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.3" {...animLine(8, 0, 0.5)} />
            <line x1={x} y1={y + dy * 8} x2={x} y2={y} stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.3" {...animLine(8, 0.05, 0.5)} />
          </g>
        );
      })}

      {/* ── Node 1: Reddit Post — fade in at delay 0.1 ── */}
      <g {...animFade(0.1)}>
        <rect x="28" y="60" width="148" height="100" rx="0" fill="oklch(0.13 0.007 60)" stroke="oklch(0.24 0.007 60)" strokeWidth="0.5" />
        <rect x="28" y="60" width="148" height="18" fill="oklch(0.16 0.007 60)" />
        <text x="36" y="73" fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="oklch(0.88 0.025 85)" letterSpacing="1.5" textAnchor="start" opacity="0.9">REDDIT POST</text>
        <rect x="36" y="86" width="52" height="10" rx="0" fill="oklch(0.88 0.025 85)" fillOpacity="0.1" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.4" />
        <text x="62" y="94" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="oklch(0.88 0.025 85)" letterSpacing="1" textAnchor="middle" opacity="0.8">r/SaaS</text>
        <rect x="36" y="103" width="120" height="4" rx="0" fill="oklch(0.93 0.010 80)" fillOpacity="0.7" />
        <rect x="36" y="112" width="96" height="4" rx="0" fill="oklch(0.93 0.010 80)" fillOpacity="0.4" />
        <rect x="36" y="121" width="108" height="4" rx="0" fill="oklch(0.93 0.010 80)" fillOpacity="0.25" />
        <text x="36" y="150" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.50 0.006 80)" letterSpacing="0.8">u/struggling_founder · 2h ago</text>
        <text x="102" y="178" fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="oklch(0.50 0.006 80)" letterSpacing="1.5" textAnchor="middle" opacity="0.7">01 — DETECT</text>
      </g>

      {/* ── Connector 1→2 — draw in at delay 0.35 ── */}
      <g>
        <line x1="176" y1="110" x2="218" y2="110" stroke="url(#connectorGrad)" strokeWidth="0.5" {...animLine(42, 0.35)} />
        <line x1="218" y1="110" x2="238" y2="110" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.4" strokeDasharray={20} strokeDashoffset={visible ? 0 : 20} style={{ transition: visible ? `stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1) 0.55s` : "none" }} />
        <path d="M 236 107 L 241 110 L 236 113" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" fill="none" strokeOpacity="0.7" {...animLine(12, 0.7, 0.4)} />
        <text x="207" y="105" fontFamily="'JetBrains Mono', monospace" fontSize="4.5" fill="oklch(0.88 0.025 85)" letterSpacing="0.8" textAnchor="middle" style={{ opacity: visible ? 0.5 : 0, transition: visible ? "opacity 0.4s ease 0.6s" : "none" }}>SIGNAL</text>
      </g>

      {/* ── Node 2: AI Analysis — fade in at delay 0.45 ── */}
      <g {...animFade(0.45)}>
        <rect x="241" y="60" width="148" height="100" rx="0" fill="oklch(0.13 0.007 60)" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.35" />
        <rect x="241" y="60" width="148" height="18" fill="oklch(0.88 0.025 85)" fillOpacity="0.12" />
        <text x="249" y="73" fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="oklch(0.88 0.025 85)" letterSpacing="1.5" textAnchor="start" opacity="0.95">AI ANALYSIS</text>
        <circle cx="378" cy="69" r="3" fill="oklch(0.88 0.025 85)" opacity="0.8" filter="url(#glow)">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
        </circle>
        {[
          { label: "CLARITY", val: 82, y: 90 },
          { label: "FIT", val: 91, y: 104 },
          { label: "VIRALITY", val: 74, y: 118 },
          { label: "SPAM RISK", val: 18, y: 132 },
        ].map(({ label, val, y }) => (
          <g key={label}>
            <text x="249" y={y + 4} fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.50 0.006 80)" letterSpacing="0.8">{label}</text>
            <rect x="305" y={y} width="60" height="5" rx="0" fill="oklch(0.18 0.007 60)" />
            <rect x="305" y={y} width={60 * val / 100} height="5" rx="0" fill={label === "SPAM RISK" ? "oklch(0.65 0.14 25)" : "oklch(0.88 0.025 85)"} fillOpacity={label === "SPAM RISK" ? 0.8 : 0.6} />
            <text x="370" y={y + 4} fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.88 0.025 85)" letterSpacing="0.5" textAnchor="end" opacity="0.8">{val}</text>
          </g>
        ))}
        <text x="315" y="178" fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="oklch(0.50 0.006 80)" letterSpacing="1.5" textAnchor="middle" opacity="0.7">02 — ANALYZE</text>
      </g>

      {/* ── Connector 2→3 — draw in at delay 0.7 ── */}
      <g>
        <line x1="389" y1="110" x2="418" y2="110" stroke="url(#connectorGrad2)" strokeWidth="0.5" {...animLine(29, 0.7)} />
        <line x1="418" y1="110" x2="438" y2="110" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.4" strokeDasharray={20} strokeDashoffset={visible ? 0 : 20} style={{ transition: visible ? `stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1) 0.85s` : "none" }} />
        <path d="M 436 107 L 441 110 L 436 113" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" fill="none" strokeOpacity="0.7" {...animLine(12, 0.95, 0.4)} />
        <text x="413" y="105" fontFamily="'JetBrains Mono', monospace" fontSize="4.5" fill="oklch(0.88 0.025 85)" letterSpacing="0.8" textAnchor="middle" style={{ opacity: visible ? 0.5 : 0, transition: visible ? "opacity 0.4s ease 0.9s" : "none" }}>DRAFT</text>
      </g>

      {/* ── Vertical connector to dashboard — draw in at delay 0.8 ── */}
      <g>
        <line x1="315" y1="160" x2="315" y2="200" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray={40} strokeDashoffset={visible ? 0 : 40} style={{ transition: visible ? `stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1) 0.8s` : "none" }} />
        <line x1="315" y1="200" x2="450" y2="200" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray={135} strokeDashoffset={visible ? 0 : 135} style={{ transition: visible ? `stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1) 0.95s` : "none" }} />
      </g>

      {/* ── Dashboard outer frame — draw in at delay 0.55 ── */}
      <rect x="440" y="28" width="316" height="364" rx="0" fill="oklch(0.11 0.007 60)" stroke="oklch(0.22 0.007 60)" strokeWidth="0.5" {...animLine(1360, 0.55, 1.2)} />

      {/* Dashboard contents — fade in at delay 0.65 ── */}
      <g {...animFade(0.65)}>
        <rect x="440" y="28" width="316" height="24" fill="oklch(0.14 0.007 60)" />
        <text x="452" y="44" fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="oklch(0.88 0.025 85)" letterSpacing="2" opacity="0.8">DM CAMPAIGNS</text>
        <circle cx="738" cy="40" r="3.5" fill="oklch(0.22 0.007 60)" />
        <circle cx="726" cy="40" r="3.5" fill="oklch(0.22 0.007 60)" />
        <circle cx="714" cy="40" r="3.5" fill="oklch(0.22 0.007 60)" />

        {/* Campaign header */}
        <rect x="452" y="64" width="292" height="28" rx="0" fill="oklch(0.14 0.007 60)" stroke="oklch(0.20 0.007 60)" strokeWidth="0.5" />
        <text x="462" y="81" fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="oklch(0.93 0.010 80)" letterSpacing="1">SaaS Founders · r/SaaS · r/startups</text>
        <rect x="660" y="68" width="72" height="14" rx="0" fill="oklch(0.88 0.025 85)" fillOpacity="0.1" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.3" />
        <text x="696" y="78" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.88 0.025 85)" letterSpacing="1" textAnchor="middle" opacity="0.8">ACTIVE · 110 LEADS</text>

        {/* Lead Card */}
        <rect x="452" y="104" width="292" height="168" rx="0" fill="oklch(0.13 0.007 60)" stroke="oklch(0.22 0.007 60)" strokeWidth="0.5" />
        <rect x="452" y="104" width="292" height="18" fill="oklch(0.15 0.007 60)" />
        <rect x="460" y="108" width="40" height="10" rx="0" fill="oklch(0.65 0.14 145)" fillOpacity="0.2" stroke="oklch(0.65 0.14 145)" strokeWidth="0.5" strokeOpacity="0.6" />
        <text x="480" y="116" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.65 0.14 145)" letterSpacing="1" textAnchor="middle">STRONG</text>
        <rect x="506" y="108" width="52" height="10" rx="0" fill="oklch(0.65 0.14 145)" fillOpacity="0.1" stroke="oklch(0.65 0.14 145)" strokeWidth="0.5" strokeOpacity="0.4" />
        <text x="532" y="116" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.65 0.14 145)" letterSpacing="1" textAnchor="middle">✓ LOW RISK · 18</text>
        <rect x="564" y="108" width="36" height="10" rx="0" fill="oklch(0.60 0.15 240)" fillOpacity="0.15" stroke="oklch(0.60 0.15 240)" strokeWidth="0.5" strokeOpacity="0.5" />
        <text x="582" y="116" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.60 0.15 240)" letterSpacing="1" textAnchor="middle">HIRING</text>

        <text x="460" y="138" fontFamily="'Inter', sans-serif" fontSize="7.5" fill="oklch(0.93 0.010 80)" fontWeight="400" letterSpacing="0.2">Struggling to find early adopters for my analytics SaaS</text>
        <text x="460" y="150" fontFamily="'Inter', sans-serif" fontSize="6.5" fill="oklch(0.50 0.006 80)" fontWeight="300">u/struggling_founder · r/SaaS · 3h ago</text>

        <line x1="460" y1="158" x2="736" y2="158" stroke="oklch(0.20 0.007 60)" strokeWidth="0.5" />

        <text x="460" y="170" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.50 0.006 80)" letterSpacing="1">FIT SCORE</text>
        <text x="460" y="182" fontFamily="'JetBrains Mono', monospace" fontSize="11" fill="oklch(0.93 0.010 80)" letterSpacing="-0.5">91</text>
        <rect x="460" y="186" width="80" height="3" rx="0" fill="oklch(0.18 0.007 60)" />
        <rect x="460" y="186" width="73" height="3" rx="0" fill="oklch(0.88 0.025 85)" fillOpacity="0.7" />
        <text x="560" y="170" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.50 0.006 80)" letterSpacing="1">URGENCY</text>
        <text x="560" y="182" fontFamily="'JetBrains Mono', monospace" fontSize="11" fill="oklch(0.93 0.010 80)" letterSpacing="-0.5">88</text>
        <rect x="560" y="186" width="80" height="3" rx="0" fill="oklch(0.18 0.007 60)" />
        <rect x="560" y="186" width="70" height="3" rx="0" fill="oklch(0.88 0.025 85)" fillOpacity="0.7" />

        <line x1="460" y1="196" x2="736" y2="196" stroke="oklch(0.20 0.007 60)" strokeWidth="0.5" />

        <text x="460" y="208" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.88 0.025 85)" letterSpacing="1" opacity="0.7">▾ VIEW DM DRAFT</text>
        <rect x="460" y="214" width="276" height="4" rx="0" fill="oklch(0.93 0.010 80)" fillOpacity="0.3" />
        <rect x="460" y="222" width="220" height="4" rx="0" fill="oklch(0.93 0.010 80)" fillOpacity="0.2" />
        <rect x="460" y="230" width="240" height="4" rx="0" fill="oklch(0.93 0.010 80)" fillOpacity="0.15" />

        <rect x="460" y="244" width="76" height="16" rx="0" fill="oklch(0.88 0.025 85)" fillOpacity="0.12" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.4" />
        <text x="498" y="255" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="oklch(0.88 0.025 85)" letterSpacing="1" textAnchor="middle">COPY & OPEN</text>
        <rect x="542" y="244" width="68" height="16" rx="0" fill="transparent" stroke="oklch(0.30 0.007 60)" strokeWidth="0.5" />
        <text x="576" y="255" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="oklch(0.50 0.006 80)" letterSpacing="1" textAnchor="middle">SPAM CHECK</text>
        <rect x="616" y="244" width="56" height="16" rx="0" fill="transparent" stroke="oklch(0.30 0.007 60)" strokeWidth="0.5" />
        <text x="644" y="255" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="oklch(0.50 0.006 80)" letterSpacing="1" textAnchor="middle">RE-DRAFT</text>

        {/* Spider graph panel */}
        <rect x="452" y="284" width="292" height="100" rx="0" fill="oklch(0.12 0.007 60)" stroke="oklch(0.20 0.007 60)" strokeWidth="0.5" />
        <text x="462" y="300" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="oklch(0.88 0.025 85)" letterSpacing="1.5" opacity="0.7">ROAST REPORT</text>
      </g>

      {/* ── Spider graph — draw in at delay 0.9 ── */}
      <g>
        {/* Grid rings — fade in */}
        {rings.map((ring, ri) => {
          const pts = axisAngles.map((a) => polarPoint(a, ring * r));
          const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
          return (
            <path key={ring} d={d} fill="none" stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity={ring === 1.0 ? 0.2 : 0.1}
              style={{ opacity: visible ? 1 : 0, transition: visible ? `opacity 0.5s ease ${0.9 + ri * 0.06}s` : "none" }} />
          );
        })}
        {/* Axis lines — draw in staggered */}
        {axisAngles.map((angle, i) => {
          const tip = polarPoint(angle, r);
          return (
            <line key={i} x1={cx} y1={cy} x2={tip.x.toFixed(1)} y2={tip.y.toFixed(1)}
              stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity="0.15"
              strokeDasharray={`${r}`} strokeDashoffset={visible ? 0 : r}
              style={{ transition: visible ? `stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1) ${0.95 + i * 0.07}s` : "none" }} />
          );
        })}
        {/* Score polygon — draw in at delay 1.3 */}
        <path d={scorePath} fill="oklch(0.88 0.025 85)" fillOpacity="0" stroke="oklch(0.88 0.025 85)" strokeWidth="1" strokeOpacity="0.7"
          strokeDasharray={400} strokeDashoffset={visible ? 0 : 400}
          style={{ fill: visible ? "oklch(0.88 0.025 85 / 0.12)" : "transparent", transition: visible ? `stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1) 1.3s, fill 0.5s ease 2.1s` : "none" }} />
        {/* Score dots */}
        {scorePoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="oklch(0.88 0.025 85)" opacity="0"
            style={{ opacity: visible ? 0.9 : 0, transition: visible ? `opacity 0.4s ease ${1.6 + i * 0.06}s` : "none" }} />
        ))}
        {/* Axis labels */}
        {AXES.map((label, i) => {
          const tip = polarPoint(axisAngles[i], r + 14);
          const lines = label.split("\n");
          return (
            <text key={i} x={tip.x.toFixed(1)} y={tip.y.toFixed(1)} fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.50 0.006 80)" letterSpacing="0.8" textAnchor="middle" dominantBaseline="middle"
              style={{ opacity: visible ? 1 : 0, transition: visible ? `opacity 0.4s ease ${1.5 + i * 0.06}s` : "none" }}>
              {lines.map((line, li) => (
                <tspan key={li} x={tip.x.toFixed(1)} dy={li === 0 ? 0 : 7}>{line}</tspan>
              ))}
            </text>
          );
        })}
        <circle cx={cx} cy={cy} r="1.5" fill="oklch(0.88 0.025 85)" opacity="0"
          style={{ opacity: visible ? 0.4 : 0, transition: visible ? "opacity 0.4s ease 1.4s" : "none" }} />
      </g>

      {/* ── Annotation lines — draw in at delay 0.75 ── */}
      <g>
        <line x1="28" y1="195" x2="28" y2="210" stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity="0.25" {...animLine(15, 0.75, 0.5)} />
        <line x1="28" y1="210" x2="80" y2="210" stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity="0.25" {...animLine(52, 0.85, 0.5)} />
        <text x="84" y="213" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.35 0.006 80)" letterSpacing="1"
          style={{ opacity: visible ? 1 : 0, transition: visible ? "opacity 0.4s ease 1.0s" : "none" }}>KEYWORD MATCH · INTENT SCORE</text>

        <line x1="241" y1="195" x2="241" y2="225" stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity="0.2" {...animLine(30, 0.85, 0.5)} />
        <line x1="241" y1="225" x2="390" y2="225" stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity="0.2" {...animLine(149, 0.95, 0.6)} />
        <text x="248" y="238" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.35 0.006 80)" letterSpacing="1"
          style={{ opacity: visible ? 1 : 0, transition: visible ? "opacity 0.4s ease 1.1s" : "none" }}>5-AXIS SCORING · SPAM FILTER</text>
      </g>

      {/* Spider graph section label */}
      <text x="152" y="258" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="oklch(0.50 0.006 80)" letterSpacing="1.5" textAnchor="middle"
        style={{ opacity: visible ? 0.7 : 0, transition: visible ? "opacity 0.4s ease 0.85s" : "none" }}>ROAST REPORT</text>
      <line x1="28" y1="265" x2="304" y2="265" stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity="0.12" {...animLine(276, 0.85, 0.6)} />

      {/* ── Bottom caption ── */}
      <line x1="440" y1="400" x2="756" y2="400" stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity="0.15"
        {...animLine(316, 0.6, 0.8)} />
      <text x="452" y="413" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.30 0.006 80)" letterSpacing="1.2"
        style={{ opacity: visible ? 1 : 0, transition: visible ? "opacity 0.5s ease 0.9s" : "none" }}>SUBROAST INTELLIGENCE CHAIN · v1.0 · 6-STEP ANALYSIS</text>
    </svg>
  );
}
