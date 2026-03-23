import { Download, X } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export function PwaInstallBanner() {
  const { canInstall, install, dismiss } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "calc(100% - 2rem)",
        maxWidth: "420px",
        background: "oklch(0.15 0.006 80)",
        border: "0.5px solid oklch(0.25 0.006 80)",
        borderRadius: "12px",
        padding: "0.875rem 1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: "oklch(0.20 0.006 80)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Download size={18} color="oklch(0.92 0.02 82)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: "oklch(0.92 0.02 82)",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          Install SubRoast
        </p>
        <p
          style={{
            fontSize: "0.7rem",
            color: "oklch(0.65 0.006 80)",
            margin: "0.15rem 0 0",
            lineHeight: 1.4,
          }}
        >
          Add to home screen for a native app experience
        </p>
      </div>
      <button
        onClick={install}
        style={{
          background: "oklch(0.92 0.02 82)",
          color: "oklch(0.10 0.006 80)",
          border: "none",
          borderRadius: "6px",
          padding: "0.4rem 0.75rem",
          fontSize: "0.72rem",
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        Install
      </button>
      <button
        onClick={dismiss}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "0.25rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <X size={16} color="oklch(0.50 0.006 80)" />
      </button>
    </div>
  );
}
