type SpinnerVariant = "primary" | "secondary" | "ghost" | "success" | "warning" | "destructive";

// Debe coincidir con el fondo real de cada variante en button.tsx, para que
// el "agujero" del anillo se funda con el botón.
const HOLE_BG: Record<SpinnerVariant, string> = {
  primary: "var(--brand)",
  success: "var(--success)",
  warning: "#f97316",
  destructive: "#dc2626",
  secondary: "var(--surface)",
  ghost: "transparent",
};

const DARK_BG_VARIANTS = new Set<SpinnerVariant>(["secondary", "ghost"]);

export function ButtonSpinner({ variant = "primary" }: { variant?: SpinnerVariant }) {
  const dark = DARK_BG_VARIANTS.has(variant);
  const ring = dark ? "var(--foreground)" : "#fff";
  const ringFaint = dark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.3)";

  return (
    <span
      aria-hidden="true"
      className="vf-spin relative inline-block h-[14px] w-[14px] shrink-0 rounded-full"
      style={{
        background: `conic-gradient(${ring} 0deg 270deg, ${ringFaint} 270deg 360deg)`,
        animation: "vf-spin 650ms linear infinite",
      }}
    >
      <span className="absolute rounded-full" style={{ inset: "3px", background: HOLE_BG[variant] }} />
    </span>
  );
}
