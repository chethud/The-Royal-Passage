import type { ReactNode } from "react";

type RoyalPalaceGatewayProps = {
  children: ReactNode;
  lit: boolean;
  formVisible: boolean;
  formGlowing: boolean;
  formDissolving: boolean;
};

export function RoyalPalaceGateway({
  children,
  lit,
  formVisible,
  formGlowing,
  formDissolving,
}: RoyalPalaceGatewayProps) {
  return (
    <div className={`royal-signin-gateway ${lit ? "is-lit" : ""}`}>
      <div className="royal-signin-gateway__lantern royal-signin-gateway__lantern--left" aria-hidden />
      <div className="royal-signin-gateway__lantern royal-signin-gateway__lantern--right" aria-hidden />

      <div className="royal-signin-gateway__pillar royal-signin-gateway__pillar--left" aria-hidden>
        <div className="royal-signin-gateway__pillar-cap" />
        <div className="royal-signin-gateway__pillar-shaft" />
        <div className="royal-signin-gateway__pillar-base" />
      </div>

      <div className="royal-signin-gateway__pillar royal-signin-gateway__pillar--right" aria-hidden>
        <div className="royal-signin-gateway__pillar-cap" />
        <div className="royal-signin-gateway__pillar-shaft" />
        <div className="royal-signin-gateway__pillar-base" />
      </div>

      <svg
        className="royal-signin-gateway__arch-svg pointer-events-none absolute top-0 left-1/2 w-[108%] max-w-none -translate-x-1/2"
        viewBox="0 0 640 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        preserveAspectRatio="xMidYMin meet"
      >
        <defs>
          <linearGradient id="royal-arch-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8F4E8" stopOpacity="0.15" />
            <stop offset="45%" stopColor="#D4AF37" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#8B6914" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <path
          d="M16 210 L16 82 Q 16 8, 320 8 Q 624 8, 624 82 L 624 210"
          stroke="url(#royal-arch-gold)"
          strokeWidth="3"
        />
        <path
          d="M44 210 L44 98 Q 44 32, 320 32 Q 596 32, 596 98 L 596 210"
          stroke="#C9A227"
          strokeWidth="1.8"
          strokeOpacity="0.55"
        />
        <path
          d="M72 210 L72 112 Q 72 56, 320 56 Q 568 56, 568 112 L 568 210"
          stroke="#D4AF37"
          strokeWidth="1"
          strokeOpacity="0.38"
        />
        <ellipse cx="320" cy="22" rx="28" ry="14" fill="#D4AF37" fillOpacity="0.12" stroke="#C9A227" strokeWidth="1" />
        <circle cx="320" cy="22" r="10" fill="#D4AF37" fillOpacity="0.3" stroke="#C9A227" strokeWidth="0.8" />
        <path
          d="M304 22 L320 38 L336 22 M312 28 L328 28"
          stroke="#F8F4E8"
          strokeWidth="0.6"
          strokeOpacity="0.5"
        />
        <path
          d="M268 210 L268 138 M352 210 L352 138 M228 210 L228 158 M392 210 L392 158 M188 210 L188 172 M432 210 L432 172"
          stroke="#D4AF37"
          strokeWidth="0.65"
          strokeOpacity="0.42"
        />
        <path
          d="M96 76 Q 136 52, 176 76 M464 76 Q 504 52, 544 76"
          stroke="#C9A227"
          strokeWidth="0.55"
          strokeOpacity="0.48"
        />
        <path
          d="M148 96 Q 168 84, 188 96 M452 96 Q 472 84, 492 96"
          stroke="#D4AF37"
          strokeWidth="0.45"
          strokeOpacity="0.4"
        />
        <path
          d="M280 64 Q 300 48, 320 64 Q 340 48, 360 64"
          stroke="#D4AF37"
          strokeWidth="0.5"
          strokeOpacity="0.45"
        />
        <path
          d="M120 130 Q 140 118, 160 130 M480 130 Q 500 118, 520 130"
          stroke="#C9A227"
          strokeWidth="0.4"
          strokeOpacity="0.35"
        />
      </svg>

      <div className="royal-signin-gateway__wall">
        <div className="royal-signin-gateway__filigree royal-signin-gateway__filigree--top" aria-hidden />
        <div className="royal-signin-gateway__filigree royal-signin-gateway__filigree--bottom" aria-hidden />

        <div
          className={`royal-signin-arch-inscription ${
            formVisible ? "is-visible" : "is-hidden"
          } ${formGlowing ? "is-glowing" : ""} ${formDissolving ? "is-dissolving" : ""}`}
        >
          {children}
        </div>
      </div>

      <div className="royal-signin-gateway__threshold" aria-hidden />
    </div>
  );
}
