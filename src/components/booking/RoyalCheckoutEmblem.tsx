import { useId } from "react";

type RoyalCheckoutEmblemProps = {
  className?: string;
};

/** Ornamental royal crest for cream checkout panels. */
export function RoyalCheckoutEmblem({ className = "" }: RoyalCheckoutEmblemProps) {
  const uid = useId().replace(/:/g, "");
  const gold = `#rp-gold-${uid}`;
  const maroon = `#rp-maroon-${uid}`;
  const glow = `#rp-glow-${uid}`;

  return (
    <svg
      viewBox="0 0 160 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id={gold} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8C872" />
          <stop offset="50%" stopColor="#C8A25A" />
          <stop offset="100%" stopColor="#9A7228" />
        </linearGradient>
        <linearGradient id={maroon} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5B0000" />
          <stop offset="100%" stopColor="#3A0000" />
        </linearGradient>
        <radialGradient id={glow} cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#C8A25A" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#C8A25A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="80" cy="88" r="72" fill={`url(#${glow})`} />

      {/* Outer rings */}
      <circle cx="80" cy="88" r="68" stroke={`url(#${gold})`} strokeWidth="1.2" opacity="0.55" />
      <circle cx="80" cy="88" r="58" stroke="#4A0000" strokeWidth="1.5" opacity="0.35" />

      {/* Side flourishes */}
      <path
        d="M12 88 C 24 72, 34 68, 44 72 M12 88 C 24 104, 34 108, 44 104"
        stroke={`url(#${gold})`}
        strokeWidth="1"
        opacity="0.65"
        strokeLinecap="round"
      />
      <path
        d="M148 88 C 136 72, 126 68, 116 72 M148 88 C 136 104, 126 108, 116 104"
        stroke={`url(#${gold})`}
        strokeWidth="1"
        opacity="0.65"
        strokeLinecap="round"
      />

      {/* Crown */}
      <path
        d="M52 42 L58 28 L68 36 L80 22 L92 36 L102 28 L108 42 Z"
        fill={`url(#${maroon})`}
        stroke={`url(#${gold})`}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="58" cy="30" r="2" fill={`url(#${gold})`} />
      <circle cx="80" cy="24" r="2.5" fill={`url(#${gold})`} />
      <circle cx="102" cy="30" r="2" fill={`url(#${gold})`} />

      {/* Shield */}
      <path
        d="M80 48 L108 62 L108 98 C108 118 96 132 80 138 C64 132 52 118 52 98 L52 62 Z"
        fill={`url(#${maroon})`}
        stroke={`url(#${gold})`}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* Inner shield detail */}
      <path
        d="M80 56 L100 67 L100 97 C100 112 92 123 80 128 C68 123 60 112 60 97 L60 67 Z"
        stroke={`url(#${gold})`}
        strokeWidth="0.8"
        opacity="0.55"
        fill="none"
      />

      {/* Royal star */}
      <path
        d="M80 72 L83.5 82 L94 82 L85.5 88.5 L89 99 L80 92.5 L71 99 L74.5 88.5 L66 82 L76.5 82 Z"
        fill={`url(#${gold})`}
      />

      {/* Monogram */}
      <text
        x="80"
        y="118"
        textAnchor="middle"
        fill="#F7F1E8"
        fontSize="11"
        fontFamily="Cinzel, ui-serif, Georgia, serif"
        letterSpacing="0.22em"
      >
        RP
      </text>

      {/* Bottom ribbon */}
      <path
        d="M48 148 Q 80 158 112 148"
        stroke={`url(#${gold})`}
        strokeWidth="1"
        opacity="0.7"
        fill="none"
      />
      <path d="M48 148 L44 154 L48 152 M112 148 L116 154 L112 152" stroke={`url(#${gold})`} strokeWidth="0.9" opacity="0.7" />

      {/* Corner dots */}
      <circle cx="80" cy="14" r="2" fill={`url(#${gold})`} opacity="0.8" />
      <circle cx="28" cy="88" r="1.5" fill="#4A0000" opacity="0.25" />
      <circle cx="132" cy="88" r="1.5" fill="#4A0000" opacity="0.25" />
    </svg>
  );
}
