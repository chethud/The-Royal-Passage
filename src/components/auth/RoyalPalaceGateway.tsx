import { type FormEvent, type ReactNode } from "react";

export type RoyalPalaceGatewaySlots = {
  decree?: ReactNode;
  annex?: ReactNode;
};

type RoyalPalaceGatewayProps = RoyalPalaceGatewaySlots & {
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
};

/**
 * Generates a foliated (cusped) Mysore-style arch path: a chain of small
 * arcs bulging into the opening, sampled along a tall elliptical arch.
 */
function cuspedArchPath(cx: number, baseY: number, rx: number, ry: number, cusps: number): string {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= cusps; i++) {
    const t = Math.PI - (Math.PI * i) / cusps;
    pts.push([cx + rx * Math.cos(t), baseY - ry * Math.sin(t)]);
  }
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1];
    const [x2, y2] = pts[i];
    const chord = Math.hypot(x2 - x1, y2 - y1);
    const r = (chord * 0.58).toFixed(1);
    d += ` A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return d;
}

const CUSPED_OUTER = cuspedArchPath(500, 600, 318, 470, 11);
const CUSPED_INNER = cuspedArchPath(500, 600, 282, 420, 9);

/** Decorative engraving medallions along the arch band. */
const ARCH_ROSETTES = Array.from({ length: 7 }, (_, i) => {
  const t = Math.PI - (Math.PI * (i + 1)) / 8;
  return {
    id: i,
    x: 500 + 352 * Math.cos(t),
    y: 600 - 512 * Math.sin(t),
  };
});

export function RoyalPalaceGateway({ decree, annex, onSubmit }: RoyalPalaceGatewayProps) {
  return (
    <form className="royal-signin-gateway is-lit is-awakening" onSubmit={onSubmit} noValidate={!onSubmit}>
      <div className="royal-signin-gateway__arch" aria-hidden>
        <svg viewBox="0 0 1000 640" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="rp-arch-stone" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8C6A2F" stopOpacity="0.9" />
              <stop offset="55%" stopColor="#5c4010" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#2a1505" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="rp-arch-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F8F4E8" stopOpacity="0.35" />
              <stop offset="45%" stopColor="#D4AF37" stopOpacity="1" />
              <stop offset="100%" stopColor="#7A5C10" stopOpacity="0.85" />
            </linearGradient>
            <radialGradient id="rp-crest-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD980" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#D4AF37" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
            </radialGradient>
          </defs>

          <path
            d="M 118 640 L 118 330 Q 118 76 500 44 Q 882 76 882 330 L 882 640"
            stroke="url(#rp-arch-stone)"
            strokeWidth="34"
            strokeLinecap="square"
          />
          <path
            d="M 142 640 L 142 332 Q 142 100 500 70 Q 858 100 858 332 L 858 640"
            stroke="url(#rp-arch-gold)"
            strokeWidth="10"
            strokeLinecap="square"
          />
          <path
            d={CUSPED_OUTER}
            stroke="#D4AF37"
            strokeWidth="5"
            strokeOpacity="0.95"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            d={CUSPED_INNER}
            stroke="#C9A227"
            strokeWidth="2.5"
            strokeOpacity="0.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {ARCH_ROSETTES.map((r) => (
            <g key={`rosette-${r.id}`} transform={`translate(${r.x.toFixed(1)} ${r.y.toFixed(1)})`}>
              <circle r="13" stroke="#C9A227" strokeWidth="1.4" strokeOpacity="0.7" />
              <circle r="6.5" fill="#D4AF37" fillOpacity="0.5" />
              <circle r="2.4" fill="#F8F4E8" fillOpacity="0.65" />
            </g>
          ))}

          <circle cx="500" cy="58" r="46" fill="url(#rp-crest-glow)" className="royal-arch-crest-glow" />
          <circle cx="500" cy="58" r="26" fill="#3B0000" stroke="#D4AF37" strokeWidth="2.2" />
          <path
            d="M500 40 L505 53 L518 53 L508 61 L512 74 L500 66 L488 74 L492 61 L482 53 L495 53 Z"
            fill="#D4AF37"
            fillOpacity="0.95"
          />
          <path d="M404 96 L412 64 L420 96 Z" fill="#8C6A2F" stroke="#C9A227" strokeWidth="1" />
          <path d="M580 96 L588 64 L596 96 Z" fill="#8C6A2F" stroke="#C9A227" strokeWidth="1" />
          <circle cx="412" cy="60" r="4" fill="#D4AF37" />
          <circle cx="588" cy="60" r="4" fill="#D4AF37" />
        </svg>
      </div>

      <div className="royal-pillar royal-pillar--left" aria-hidden>
        <span className="royal-pillar__finial" />
        <span className="royal-pillar__cap" />
        <span className="royal-pillar__shaft">
          <i className="royal-pillar__inlay" />
          <i className="royal-pillar__inlay royal-pillar__inlay--mid" />
          <i className="royal-pillar__inlay royal-pillar__inlay--low" />
        </span>
        <span className="royal-pillar__base" />
      </div>
      <div className="royal-pillar royal-pillar--right" aria-hidden>
        <span className="royal-pillar__finial" />
        <span className="royal-pillar__cap" />
        <span className="royal-pillar__shaft">
          <i className="royal-pillar__inlay" />
          <i className="royal-pillar__inlay royal-pillar__inlay--mid" />
          <i className="royal-pillar__inlay royal-pillar__inlay--low" />
        </span>
        <span className="royal-pillar__base" />
      </div>

      <div className="royal-lantern royal-lantern--left" aria-hidden>
        <span className="royal-lantern__chain" />
        <span className="royal-lantern__body">
          <span className="royal-lantern__flame" />
        </span>
      </div>
      <div className="royal-lantern royal-lantern--right" aria-hidden>
        <span className="royal-lantern__chain" />
        <span className="royal-lantern__body">
          <span className="royal-lantern__flame" />
        </span>
      </div>

      <div className="royal-signin-gateway__opening">
        <div className="royal-signin-gateway__opening-glow" aria-hidden />
        <div className="royal-signin-gateway__opening-mist" aria-hidden />
        <div className="royal-signin-gateway__energy-veins" aria-hidden />

        {decree ? (
          <div className="royal-gate-decree is-visible is-glowing">
            <div className="royal-gate-decree__stone-frame" aria-hidden />
            <div className="royal-gate-decree__content">{decree}</div>
          </div>
        ) : null}

        {annex ? <div className="royal-signin-gateway__annex">{annex}</div> : null}
      </div>

      <div className="royal-gate-steps" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <div className="royal-signin-gateway__breath" aria-hidden />
    </form>
  );
}
