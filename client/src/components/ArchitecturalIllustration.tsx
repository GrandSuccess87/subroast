/**
 * ArchitecturalIllustration
 * Precision schematic: Reddit post → AI analysis → DM campaign
 * resolving into a stylized dashboard preview (lead card + spam badge + spider graph)
 */
export function ArchitecturalIllustration() {
  // Spider graph axes: 5 metrics
  const AXES = ["Clarity", "Fit", "Virality", "Spam\nRisk", "Urgency"];
  const SCORES = [0.82, 0.91, 0.74, 0.18, 0.88]; // sample values
  const cx = 220, cy = 148, r = 72;

  function polarPoint(angle: number, radius: number) {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const axisAngles = AXES.map((_, i) => (360 / AXES.length) * i);
  const scorePoints = SCORES.map((s, i) => polarPoint(axisAngles[i], s * r));
  const scorePath = scorePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  // Grid rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg
      viewBox="0 0 780 420"
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
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* Subtle grid pattern */}
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="oklch(0.88 0.025 85)" strokeWidth="0.3" strokeOpacity="0.06" />
        </pattern>
      </defs>

      {/* Background */}
      <rect width="780" height="420" fill="oklch(0.10 0.007 60)" />
      <rect width="780" height="420" fill="url(#grid)" />

      {/* Ambient glow behind dashboard panel */}
      <ellipse cx="530" cy="210" rx="200" ry="140" fill="oklch(0.88 0.025 85)" fillOpacity="0.03" />

      {/* ─────────────────────────────────────────
          FLOW DIAGRAM — LEFT ZONE (x: 0–380)
          Three nodes connected by schematic lines
          ───────────────────────────────────────── */}

      {/* ── Node 1: Reddit Post ── */}
      {/* Card */}
      <rect x="28" y="60" width="148" height="100" rx="0" fill="oklch(0.13 0.007 60)" stroke="oklch(0.24 0.007 60)" strokeWidth="0.5" />
      {/* Header bar */}
      <rect x="28" y="60" width="148" height="18" fill="oklch(0.16 0.007 60)" />
      {/* Header label */}
      <text x="36" y="73" fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="oklch(0.88 0.025 85)" letterSpacing="1.5" textAnchor="start" opacity="0.9">REDDIT POST</text>
      {/* Subreddit pill */}
      <rect x="36" y="86" width="52" height="10" rx="0" fill="oklch(0.88 0.025 85)" fillOpacity="0.1" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.4" />
      <text x="62" y="94" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="oklch(0.88 0.025 85)" letterSpacing="1" textAnchor="middle" opacity="0.8">r/SaaS</text>
      {/* Post title lines */}
      <rect x="36" y="103" width="120" height="4" rx="0" fill="oklch(0.93 0.010 80)" fillOpacity="0.7" />
      <rect x="36" y="112" width="96" height="4" rx="0" fill="oklch(0.93 0.010 80)" fillOpacity="0.4" />
      <rect x="36" y="121" width="108" height="4" rx="0" fill="oklch(0.93 0.010 80)" fillOpacity="0.25" />
      {/* Author line */}
      <text x="36" y="150" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.50 0.006 80)" letterSpacing="0.8">u/struggling_founder · 2h ago</text>
      {/* Node label */}
      <text x="102" y="178" fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="oklch(0.50 0.006 80)" letterSpacing="1.5" textAnchor="middle" opacity="0.7">01 — DETECT</text>

      {/* ── Connector 1→2 ── */}
      {/* Horizontal line with arrow */}
      <line x1="176" y1="110" x2="218" y2="110" stroke="url(#connectorGrad)" strokeWidth="0.5" />
      {/* Dashed segment */}
      <line x1="218" y1="110" x2="238" y2="110" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeDasharray="3 3" strokeOpacity="0.4" />
      {/* Arrow head */}
      <path d="M 236 107 L 241 110 L 236 113" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" fill="none" strokeOpacity="0.7" />
      {/* Connector label */}
      <text x="207" y="105" fontFamily="'JetBrains Mono', monospace" fontSize="4.5" fill="oklch(0.88 0.025 85)" letterSpacing="0.8" textAnchor="middle" opacity="0.5">SIGNAL</text>

      {/* ── Node 2: AI Analysis Engine ── */}
      <rect x="241" y="60" width="148" height="100" rx="0" fill="oklch(0.13 0.007 60)" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.35" />
      {/* Header bar — platinum accent */}
      <rect x="241" y="60" width="148" height="18" fill="oklch(0.88 0.025 85)" fillOpacity="0.12" />
      <text x="249" y="73" fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="oklch(0.88 0.025 85)" letterSpacing="1.5" textAnchor="start" opacity="0.95">AI ANALYSIS</text>
      {/* Pulsating dot */}
      <circle cx="378" cy="69" r="3" fill="oklch(0.88 0.025 85)" opacity="0.8" filter="url(#glow)">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Score rows */}
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
      {/* Node label */}
      <text x="315" y="178" fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="oklch(0.50 0.006 80)" letterSpacing="1.5" textAnchor="middle" opacity="0.7">02 — ANALYZE</text>

      {/* ── Connector 2→3 ── */}
      <line x1="389" y1="110" x2="418" y2="110" stroke="url(#connectorGrad2)" strokeWidth="0.5" />
      <line x1="418" y1="110" x2="438" y2="110" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeDasharray="3 3" strokeOpacity="0.4" />
      <path d="M 436 107 L 441 110 L 436 113" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" fill="none" strokeOpacity="0.7" />
      <text x="413" y="105" fontFamily="'JetBrains Mono', monospace" fontSize="4.5" fill="oklch(0.88 0.025 85)" letterSpacing="0.8" textAnchor="middle" opacity="0.5">DRAFT</text>

      {/* ── Vertical connector from flow to dashboard ── */}
      <line x1="315" y1="160" x2="315" y2="200" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 4" />
      <line x1="315" y1="200" x2="450" y2="200" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="4 4" />

      {/* ─────────────────────────────────────────
          DASHBOARD PREVIEW — RIGHT ZONE (x: 440–760)
          Lead card + spam badge + spider graph
          ───────────────────────────────────────── */}

      {/* Dashboard outer frame */}
      <rect x="440" y="28" width="316" height="364" rx="0" fill="oklch(0.11 0.007 60)" stroke="oklch(0.22 0.007 60)" strokeWidth="0.5" />

      {/* Dashboard top bar */}
      <rect x="440" y="28" width="316" height="24" fill="oklch(0.14 0.007 60)" />
      <text x="452" y="44" fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="oklch(0.88 0.025 85)" letterSpacing="2" opacity="0.8">DM CAMPAIGNS</text>
      {/* Window controls */}
      <circle cx="738" cy="40" r="3.5" fill="oklch(0.22 0.007 60)" />
      <circle cx="726" cy="40" r="3.5" fill="oklch(0.22 0.007 60)" />
      <circle cx="714" cy="40" r="3.5" fill="oklch(0.22 0.007 60)" />

      {/* Campaign header */}
      <rect x="452" y="64" width="292" height="28" rx="0" fill="oklch(0.14 0.007 60)" stroke="oklch(0.20 0.007 60)" strokeWidth="0.5" />
      <text x="462" y="81" fontFamily="'JetBrains Mono', monospace" fontSize="6.5" fill="oklch(0.93 0.010 80)" letterSpacing="1">SaaS Founders · r/SaaS · r/startups</text>
      {/* Sync badge */}
      <rect x="660" y="68" width="72" height="14" rx="0" fill="oklch(0.88 0.025 85)" fillOpacity="0.1" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.3" />
      <text x="696" y="78" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.88 0.025 85)" letterSpacing="1" textAnchor="middle" opacity="0.8">ACTIVE · 110 LEADS</text>

      {/* ── Lead Card ── */}
      <rect x="452" y="104" width="292" height="168" rx="0" fill="oklch(0.13 0.007 60)" stroke="oklch(0.22 0.007 60)" strokeWidth="0.5" />

      {/* Lead card header */}
      <rect x="452" y="104" width="292" height="18" fill="oklch(0.15 0.007 60)" />
      {/* Match badge — STRONG */}
      <rect x="460" y="108" width="40" height="10" rx="0" fill="oklch(0.65 0.14 145)" fillOpacity="0.2" stroke="oklch(0.65 0.14 145)" strokeWidth="0.5" strokeOpacity="0.6" />
      <text x="480" y="116" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.65 0.14 145)" letterSpacing="1" textAnchor="middle">STRONG</text>
      {/* Spam badge — LOW RISK */}
      <rect x="506" y="108" width="52" height="10" rx="0" fill="oklch(0.65 0.14 145)" fillOpacity="0.1" stroke="oklch(0.65 0.14 145)" strokeWidth="0.5" strokeOpacity="0.4" />
      <text x="532" y="116" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.65 0.14 145)" letterSpacing="1" textAnchor="middle">✓ LOW RISK · 18</text>
      {/* Hiring badge */}
      <rect x="564" y="108" width="36" height="10" rx="0" fill="oklch(0.60 0.15 240)" fillOpacity="0.15" stroke="oklch(0.60 0.15 240)" strokeWidth="0.5" strokeOpacity="0.5" />
      <text x="582" y="116" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.60 0.15 240)" letterSpacing="1" textAnchor="middle">HIRING</text>

      {/* Post title */}
      <text x="460" y="138" fontFamily="'Inter', sans-serif" fontSize="7.5" fill="oklch(0.93 0.010 80)" fontWeight="400" letterSpacing="0.2">Struggling to find early adopters for my analytics SaaS</text>
      <text x="460" y="150" fontFamily="'Inter', sans-serif" fontSize="6.5" fill="oklch(0.50 0.006 80)" fontWeight="300">u/struggling_founder · r/SaaS · 3h ago</text>

      {/* Divider */}
      <line x1="460" y1="158" x2="736" y2="158" stroke="oklch(0.20 0.007 60)" strokeWidth="0.5" />

      {/* Score grid — 2 columns */}
      {/* FIT */}
      <text x="460" y="170" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.50 0.006 80)" letterSpacing="1">FIT SCORE</text>
      <text x="460" y="182" fontFamily="'JetBrains Mono', monospace" fontSize="11" fill="oklch(0.93 0.010 80)" letterSpacing="-0.5">91</text>
      <rect x="460" y="186" width="80" height="3" rx="0" fill="oklch(0.18 0.007 60)" />
      <rect x="460" y="186" width="73" height="3" rx="0" fill="oklch(0.88 0.025 85)" fillOpacity="0.7" />
      {/* URGENCY */}
      <text x="560" y="170" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.50 0.006 80)" letterSpacing="1">URGENCY</text>
      <text x="560" y="182" fontFamily="'JetBrains Mono', monospace" fontSize="11" fill="oklch(0.93 0.010 80)" letterSpacing="-0.5">88</text>
      <rect x="560" y="186" width="80" height="3" rx="0" fill="oklch(0.18 0.007 60)" />
      <rect x="560" y="186" width="70" height="3" rx="0" fill="oklch(0.88 0.025 85)" fillOpacity="0.7" />

      {/* Divider */}
      <line x1="460" y1="196" x2="736" y2="196" stroke="oklch(0.20 0.007 60)" strokeWidth="0.5" />

      {/* DM Draft preview */}
      <text x="460" y="208" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.88 0.025 85)" letterSpacing="1" opacity="0.7">▾ VIEW DM DRAFT</text>
      <rect x="460" y="214" width="276" height="4" rx="0" fill="oklch(0.93 0.010 80)" fillOpacity="0.3" />
      <rect x="460" y="222" width="220" height="4" rx="0" fill="oklch(0.93 0.010 80)" fillOpacity="0.2" />
      <rect x="460" y="230" width="240" height="4" rx="0" fill="oklch(0.93 0.010 80)" fillOpacity="0.15" />

      {/* Action buttons */}
      <rect x="460" y="244" width="76" height="16" rx="0" fill="oklch(0.88 0.025 85)" fillOpacity="0.12" stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.4" />
      <text x="498" y="255" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="oklch(0.88 0.025 85)" letterSpacing="1" textAnchor="middle">COPY & OPEN</text>
      <rect x="542" y="244" width="68" height="16" rx="0" fill="transparent" stroke="oklch(0.30 0.007 60)" strokeWidth="0.5" />
      <text x="576" y="255" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="oklch(0.50 0.006 80)" letterSpacing="1" textAnchor="middle">SPAM CHECK</text>
      <rect x="616" y="244" width="56" height="16" rx="0" fill="transparent" stroke="oklch(0.30 0.007 60)" strokeWidth="0.5" />
      <text x="644" y="255" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="oklch(0.50 0.006 80)" letterSpacing="1" textAnchor="middle">RE-DRAFT</text>

      {/* ── Spider / Radar Graph ── */}
      <rect x="452" y="284" width="292" height="100" rx="0" fill="oklch(0.12 0.007 60)" stroke="oklch(0.20 0.007 60)" strokeWidth="0.5" />
      <text x="462" y="300" fontFamily="'JetBrains Mono', monospace" fontSize="5.5" fill="oklch(0.88 0.025 85)" letterSpacing="1.5" opacity="0.7">ROAST REPORT</text>

      {/* Spider graph — centered at cx=220+440=... use local coords within the rect */}
      {/* Translate: graph center at (598, 335) */}
      <g transform="translate(378, 0)">
        {/* Grid rings */}
        {rings.map((ring) => {
          const pts = axisAngles.map((a) => polarPoint(a, ring * r));
          const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
          return (
            <path key={ring} d={d} fill="none" stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity={ring === 1.0 ? 0.2 : 0.1} />
          );
        })}
        {/* Axis lines */}
        {axisAngles.map((angle, i) => {
          const tip = polarPoint(angle, r);
          return (
            <line key={i} x1={cx} y1={cy} x2={tip.x.toFixed(1)} y2={tip.y.toFixed(1)} stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity="0.15" />
          );
        })}
        {/* Score polygon */}
        <path d={scorePath} fill="oklch(0.88 0.025 85)" fillOpacity="0.12" stroke="oklch(0.88 0.025 85)" strokeWidth="1" strokeOpacity="0.7" />
        {/* Score dots */}
        {scorePoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="oklch(0.88 0.025 85)" opacity="0.9" />
        ))}
        {/* Axis labels */}
        {AXES.map((label, i) => {
          const tip = polarPoint(axisAngles[i], r + 14);
          const lines = label.split("\n");
          return (
            <text key={i} x={tip.x.toFixed(1)} y={tip.y.toFixed(1)} fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.50 0.006 80)" letterSpacing="0.8" textAnchor="middle" dominantBaseline="middle">
              {lines.map((line, li) => (
                <tspan key={li} x={tip.x.toFixed(1)} dy={li === 0 ? 0 : 7}>{line}</tspan>
              ))}
            </text>
          );
        })}
        {/* Center dot */}
        <circle cx={cx} cy={cy} r="1.5" fill="oklch(0.88 0.025 85)" opacity="0.4" />
      </g>

      {/* ── Schematic annotation lines ── */}
      {/* Left annotation: "DETECT" */}
      <line x1="28" y1="195" x2="28" y2="210" stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity="0.25" />
      <line x1="28" y1="210" x2="80" y2="210" stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity="0.25" />
      <text x="84" y="213" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.35 0.006 80)" letterSpacing="1">KEYWORD MATCH · INTENT SCORE</text>

      {/* Center annotation */}
      <line x1="241" y1="195" x2="241" y2="225" stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity="0.2" />
      <line x1="241" y1="225" x2="390" y2="225" stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity="0.2" />
      <text x="248" y="238" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.35 0.006 80)" letterSpacing="1">5-AXIS SCORING · SPAM FILTER</text>

      {/* Bottom caption line */}
      <line x1="440" y1="400" x2="756" y2="400" stroke="oklch(0.88 0.025 85)" strokeWidth="0.4" strokeOpacity="0.15" />
      <text x="452" y="413" fontFamily="'JetBrains Mono', monospace" fontSize="5" fill="oklch(0.30 0.006 80)" letterSpacing="1.2">SUBROAST INTELLIGENCE CHAIN · v1.0 · 6-STEP ANALYSIS</text>

      {/* Corner marks — precision instrument aesthetic */}
      {[[0,0],[780,0],[0,420],[780,420]].map(([x, y], i) => {
        const dx = x === 0 ? 1 : -1, dy = y === 0 ? 1 : -1;
        return (
          <g key={i}>
            <line x1={x + dx * 8} y1={y} x2={x} y2={y} stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.3" />
            <line x1={x} y1={y + dy * 8} x2={x} y2={y} stroke="oklch(0.88 0.025 85)" strokeWidth="0.5" strokeOpacity="0.3" />
          </g>
        );
      })}
    </svg>
  );
}
