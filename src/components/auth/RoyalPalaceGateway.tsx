import { useEffect, useRef, type FormEvent, type ReactNode } from "react";

export type RoyalPalaceGatewaySlots = {
  decree?: ReactNode;
  annex?: ReactNode;
};

type RoyalPalaceGatewayProps = RoyalPalaceGatewaySlots & {
  lit: boolean;
  formVisible: boolean;
  formGlowing: boolean;
  formDissolving: boolean;
  sealActive: boolean;
  activationActive: boolean;
  showSealRings: boolean;
  showDissolveParticles: boolean;
  showDoors: boolean;
  doorsRevealing: boolean;
  doorsUnlocking: boolean;
  doorsOpen: boolean;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
};

const DISSOLVE_PARTICLES = Array.from({ length: 64 }, (_, i) => ({
  id: i,
  left: `${8 + ((i * 13) % 84)}%`,
  top: `${30 + ((i * 7) % 45)}%`,
  delay: `${(i * 0.025) % 1.1}s`,
  size: 2 + (i % 4),
  drift: `${-70 + (i % 10) * 16}px`,
}));

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

export function RoyalPalaceGateway({
  decree,
  annex,
  lit,
  formVisible,
  formGlowing,
  formDissolving,
  sealActive,
  activationActive,
  showSealRings,
  showDissolveParticles,
  showDoors,
  doorsRevealing,
  doorsUnlocking,
  doorsOpen,
  onSubmit,
}: RoyalPalaceGatewayProps) {
  const archPathRefs = useRef<Array<SVGPathElement | null>>([]);

  // Stage 3 — illuminate the arch with an SVG stroke draw-on when lit.
  useEffect(() => {
    archPathRefs.current.forEach((path, i) => {
      if (!path) return;
      const len = path.getTotalLength();
      path.style.strokeDasharray = String(len);
      if (lit) {
        path.style.transition = "none";
        path.style.strokeDashoffset = String(len);
        // force reflow so the transition runs from the offset start
        void path.getBoundingClientRect();
        requestAnimationFrame(() => {
          path.style.transition = `stroke-dashoffset 2.6s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.3}s`;
          path.style.strokeDashoffset = "0";
        });
      } else {
        path.style.transition = "none";
        path.style.strokeDashoffset = String(len);
      }
    });
  }, [lit]);

  const decreeClass = [
    "royal-gate-decree",
    formVisible ? "is-visible" : "is-hidden",
    formGlowing ? "is-glowing" : "",
    formDissolving ? "is-dissolving" : "",
    sealActive ? "is-seal-active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <form
      className={`royal-signin-gateway ${lit ? "is-lit" : ""} ${activationActive ? "is-awakening" : ""}`}
      onSubmit={onSubmit}
      noValidate={!onSubmit}
    >
      {/* ───── Monumental arch — foliated Mysore gateway carved in gold ───── */}
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

          {/* heavy stone archivolt */}
          <path
            d="M 118 640 L 118 330 Q 118 76 500 44 Q 882 76 882 330 L 882 640"
            stroke="url(#rp-arch-stone)"
            strokeWidth="34"
            strokeLinecap="square"
          />
          {/* engraved gold band */}
          <path
            ref={(el) => { archPathRefs.current[0] = el; }}
            d="M 142 640 L 142 332 Q 142 100 500 70 Q 858 100 858 332 L 858 640"
            stroke="url(#rp-arch-gold)"
            strokeWidth="10"
            strokeLinecap="square"
          />
          {/* foliated cusped arches — the signature Mysore silhouette */}
          <path
            ref={(el) => { archPathRefs.current[1] = el; }}
            d={CUSPED_OUTER}
            stroke="#D4AF37"
            strokeWidth="5"
            strokeOpacity="0.95"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <path
            ref={(el) => { archPathRefs.current[2] = el; }}
            d={CUSPED_INNER}
            stroke="#C9A227"
            strokeWidth="2.5"
            strokeOpacity="0.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* engraved rosette medallions following the archivolt */}
          {ARCH_ROSETTES.map((r) => (
            <g key={`rosette-${r.id}`} transform={`translate(${r.x.toFixed(1)} ${r.y.toFixed(1)})`}>
              <circle r="13" stroke="#C9A227" strokeWidth="1.4" strokeOpacity="0.7" />
              <circle r="6.5" fill="#D4AF37" fillOpacity="0.5" />
              <circle r="2.4" fill="#F8F4E8" fillOpacity="0.65" />
            </g>
          ))}

          {/* apex keystone crest */}
          <circle cx="500" cy="58" r="46" fill="url(#rp-crest-glow)" className="royal-arch-crest-glow" />
          <circle cx="500" cy="58" r="26" fill="#3B0000" stroke="#D4AF37" strokeWidth="2.2" />
          <path
            d="M500 40 L505 53 L518 53 L508 61 L512 74 L500 66 L488 74 L492 61 L482 53 L495 53 Z"
            fill="#D4AF37"
            fillOpacity="0.95"
          />
          {/* finial spires flanking the keystone */}
          <path d="M404 96 L412 64 L420 96 Z" fill="#8C6A2F" stroke="#C9A227" strokeWidth="1" />
          <path d="M580 96 L588 64 L596 96 Z" fill="#8C6A2F" stroke="#C9A227" strokeWidth="1" />
          <circle cx="412" cy="60" r="4" fill="#D4AF37" />
          <circle cx="588" cy="60" r="4" fill="#D4AF37" />
        </svg>
      </div>

      {/* ───── Colossal carved pillars ───── */}
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

      {/* ───── Hanging royal lanterns ───── */}
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

        {showDoors ? (
          <div
            className={`royal-signin-portal-doors ${doorsRevealing ? "is-revealed" : ""} ${doorsUnlocking ? "is-unlocking" : ""} ${doorsOpen ? "is-open" : ""}`}
          >
            <div className="royal-signin-portal-door royal-signin-portal-door--left">
              <div className="royal-signin-portal-door__panel">
                <div className="royal-signin-portal-door__arch-panel" />
                <div className="royal-signin-portal-door__emblem" />
                <div className="royal-signin-portal-door__studs" />
                <div className="royal-signin-portal-door__carving" />
              </div>
              <div className="royal-signin-portal-door__ring" />
            </div>
            <div className="royal-signin-portal-door__seam" aria-hidden />
            <div className="royal-signin-portal-door royal-signin-portal-door--right">
              <div className="royal-signin-portal-door__panel">
                <div className="royal-signin-portal-door__arch-panel" />
                <div className="royal-signin-portal-door__emblem" />
                <div className="royal-signin-portal-door__studs" />
                <div className="royal-signin-portal-door__carving" />
              </div>
              <div className="royal-signin-portal-door__ring" />
            </div>
          </div>
        ) : null}

        {showDoors ? (
          <div className={`royal-signin-portal-burst ${doorsOpen ? "is-active" : ""} ${doorsUnlocking ? "is-leaking" : ""}`} aria-hidden />
        ) : null}

        {showDissolveParticles ? (
          <div className="royal-signin-dissolve-particles" aria-hidden>
            {DISSOLVE_PARTICLES.map((p) => (
              <span
                key={`dissolve-${p.id}`}
                className="royal-signin-dissolve-mote"
                style={{
                  left: p.left,
                  top: p.top,
                  width: p.size,
                  height: p.size,
                  animationDelay: p.delay,
                  ["--drift" as string]: p.drift,
                }}
              />
            ))}
          </div>
        ) : null}

        {decree ? (
          <div className={decreeClass}>
            <div className="royal-gate-decree__stone-frame" aria-hidden />
            {showSealRings ? (
              <div className="royal-signin-seal-rings" aria-hidden>
                <span className="royal-signin-seal-ring" />
                <span className="royal-signin-seal-ring royal-signin-seal-ring--delay" />
                <span className="royal-signin-seal-ring royal-signin-seal-ring--delay2" />
              </div>
            ) : null}
            <div className="royal-gate-decree__content">{decree}</div>
          </div>
        ) : null}

        {annex ? <div className="royal-signin-gateway__annex">{annex}</div> : null}
      </div>

      {/* ───── Stone steps to the gate ───── */}
      <div className="royal-gate-steps" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <div className="royal-signin-gateway__breath" aria-hidden />
    </form>
  );
}
