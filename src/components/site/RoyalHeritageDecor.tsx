const GOLD = "#D4AF37";
const AGED_GOLD = "#C9A227";

export function PalaceArchFrame({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M8 44 L8 28 Q 8 8, 160 8 Q 312 8, 312 28 L 312 44"
        stroke={GOLD}
        strokeWidth="0.8"
        strokeOpacity="0.55"
      />
      <path
        d="M24 44 L24 30 Q 24 16, 160 16 Q 296 16, 296 30 L 296 44"
        stroke={AGED_GOLD}
        strokeWidth="0.5"
        strokeOpacity="0.35"
      />
      <circle cx="160" cy="10" r="3" fill={GOLD} fillOpacity="0.45" />
      <path d="M140 44 L140 24 M180 44 L180 24" stroke={GOLD} strokeWidth="0.4" strokeOpacity="0.3" />
    </svg>
  );
}

export function CornerFiligree({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 52 L4 22 C 4 10, 12 4, 24 4 L52 4"
        stroke={GOLD}
        strokeWidth="0.85"
        strokeOpacity="0.75"
      />
      <path
        d="M10 48 L10 26 C 10 16, 16 10, 26 10 L48 10"
        stroke={AGED_GOLD}
        strokeWidth="0.55"
        strokeOpacity="0.5"
      />
      <circle cx="14" cy="14" r="2" fill={GOLD} fillOpacity="0.5" />
    </svg>
  );
}

export function MaharajaEmblem({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="20" cy="20" r="17" stroke={GOLD} strokeWidth="0.8" strokeOpacity="0.6" />
      <circle cx="20" cy="20" r="12" stroke={AGED_GOLD} strokeWidth="0.5" strokeOpacity="0.45" />
      <path
        d="M20 8 L24 16 L32 16 L26 22 L28 32 L20 26 L12 32 L14 22 L8 16 L16 16 Z"
        stroke={GOLD}
        strokeWidth="0.6"
        strokeOpacity="0.55"
        fill={GOLD}
        fillOpacity="0.12"
      />
      <circle cx="20" cy="20" r="3" fill={GOLD} fillOpacity="0.65" />
    </svg>
  );
}

export function HeritageCompass({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="32" cy="32" r="28" stroke={GOLD} strokeWidth="0.7" strokeOpacity="0.45" />
      <circle cx="32" cy="32" r="20" stroke={AGED_GOLD} strokeWidth="0.5" strokeOpacity="0.35" />
      <path d="M32 6 L32 58 M6 32 L58 32" stroke={GOLD} strokeWidth="0.4" strokeOpacity="0.3" />
      <path d="M32 12 L36 32 L32 52 L28 32 Z" fill={GOLD} fillOpacity="0.2" stroke={GOLD} strokeWidth="0.5" />
      <circle cx="32" cy="32" r="3" fill={AGED_GOLD} fillOpacity="0.7" />
    </svg>
  );
}

export function PalaceDoorPanel({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={`royal-door-panel absolute inset-y-0 w-full ${
        side === "left" ? "left-0 border-r" : "right-0 border-l"
      } border-[#C9A227]/30`}
    >
      <div className="royal-door-carving absolute inset-3 rounded-sm border border-[#D4AF37]/30" />
      <div
        className={`royal-door-handle absolute top-1/2 h-12 w-2.5 -translate-y-1/2 rounded-full ${
          side === "left" ? "right-6" : "left-6"
        }`}
      />
    </div>
  );
}
