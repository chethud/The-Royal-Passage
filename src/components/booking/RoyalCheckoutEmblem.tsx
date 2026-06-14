import { useId } from "react";

type RoyalCheckoutEmblemProps = {
  className?: string;
};

const ROSETTE_COUNT = 5;

function archRosettes(cx: number, cy: number, rx: number, ry: number) {
  return Array.from({ length: ROSETTE_COUNT }, (_, i) => {
    const t = Math.PI - (Math.PI * (i + 1)) / (ROSETTE_COUNT + 1);
    return {
      id: i,
      x: cx + rx * Math.cos(t),
      y: cy - ry * Math.sin(t),
    };
  });
}

/** Editorial palace-arch ornament for cream checkout panels. */
export function RoyalCheckoutEmblem({ className = "" }: RoyalCheckoutEmblemProps) {
  const uid = useId().replace(/:/g, "");
  const gold = `#rp-gold-${uid}`;
  const maroon = `#rp-maroon-${uid}`;
  const wash = `#rp-wash-${uid}`;

  const rosettes = archRosettes(120, 78, 88, 62);

  return (
    <svg
      viewBox="0 0 240 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id={gold} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C872" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#C8A25A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#9A7228" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id={maroon} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5B0000" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#3A0000" stopOpacity="0.72" />
        </linearGradient>
        <radialGradient id={wash} cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#C8A25A" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#C8A25A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="120" cy="52" rx="98" ry="46" fill={`url(#${wash})`} />

      {/* Cusped arch — primary motif */}
      <path
        d="M18 96 L18 54 Q18 16 120 10 Q222 16 222 54 L222 96"
        stroke={`url(#${gold})`}
        strokeWidth="1.1"
        strokeOpacity="0.72"
      />
      <path
        d="M34 96 L34 56 Q34 26 120 22 Q206 26 206 56 L206 96"
        stroke={`url(#${maroon})`}
        strokeWidth="0.85"
        strokeOpacity="0.42"
      />

      {/* Pilaster lines */}
      <path d="M18 96 L18 38" stroke={`url(#${maroon})`} strokeWidth="0.7" strokeOpacity="0.28" />
      <path d="M222 96 L222 38" stroke={`url(#${maroon})`} strokeWidth="0.7" strokeOpacity="0.28" />
      <path d="M34 96 L34 44" stroke={`url(#${gold})`} strokeWidth="0.55" strokeOpacity="0.35" />
      <path d="M206 96 L206 44" stroke={`url(#${gold})`} strokeWidth="0.55" strokeOpacity="0.35" />

      {/* Arch rosettes */}
      {rosettes.map((r) => (
        <g key={`rosette-${r.id}`} transform={`translate(${r.x.toFixed(1)} ${r.y.toFixed(1)})`}>
          <circle r="7.5" stroke={`url(#${gold})`} strokeWidth="0.85" strokeOpacity="0.55" />
          <circle r="3.6" fill={`url(#${gold})`} fillOpacity="0.22" />
          <circle r="1.2" fill={`url(#${gold})`} fillOpacity="0.55" />
        </g>
      ))}

      {/* Central medallion — outlined compass star */}
      <circle cx="120" cy="18" r="11" stroke={`url(#${gold})`} strokeWidth="0.9" strokeOpacity="0.65" />
      <circle cx="120" cy="18" r="6.5" stroke={`url(#${maroon})`} strokeWidth="0.65" strokeOpacity="0.45" />
      <path
        d="M120 10 L123 18 L131 18 L125 23 L127 31 L120 26 L113 31 L115 23 L109 18 L117 18 Z"
        stroke={`url(#${gold})`}
        strokeWidth="0.75"
        strokeOpacity="0.7"
        fill={`url(#${gold})`}
        fillOpacity="0.14"
        strokeLinejoin="round"
      />

      {/* Side filigree brackets */}
      <path
        d="M8 72 L8 48 C8 38 14 32 24 32 L42 32"
        stroke={`url(#${gold})`}
        strokeWidth="0.75"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />
      <path
        d="M232 72 L232 48 C232 38 226 32 216 32 L198 32"
        stroke={`url(#${gold})`}
        strokeWidth="0.75"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="36" r="1.4" fill={`url(#${gold})`} fillOpacity="0.55" />
      <circle cx="216" cy="36" r="1.4" fill={`url(#${gold})`} fillOpacity="0.55" />

      {/* Base rule with diamond */}
      <path d="M52 96 H188" stroke={`url(#${gold})`} strokeWidth="0.8" strokeOpacity="0.45" />
      <path
        d="M120 90 L124 96 L120 102 L116 96 Z"
        stroke={`url(#${maroon})`}
        strokeWidth="0.7"
        strokeOpacity="0.5"
        fill={`url(#${gold})`}
        fillOpacity="0.12"
        strokeLinejoin="round"
      />

      {/* Delicate inner axis */}
      <path d="M120 28 L120 88" stroke={`url(#${maroon})`} strokeWidth="0.45" strokeOpacity="0.18" />
      <path d="M72 68 L168 68" stroke={`url(#${maroon})`} strokeWidth="0.45" strokeOpacity="0.14" />
    </svg>
  );
}
