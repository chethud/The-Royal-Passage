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

const DISSOLVE_PARTICLES = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: `${12 + ((i * 17) % 76)}%`,
  delay: `${(i * 0.03) % 0.9}s`,
  size: 2 + (i % 4),
  drift: `${-40 + (i % 8) * 12}px`,
}));

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
          path.style.transition = `stroke-dashoffset 2s ease-in-out ${i * 0.2}s`;
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
      <div className="royal-signin-gateway__chhatris" aria-hidden>
        <span className="royal-signin-gateway__chhatri" />
        <span className="royal-signin-gateway__chhatri royal-signin-gateway__chhatri--center" />
        <span className="royal-signin-gateway__chhatri" />
      </div>

      <div className="royal-signin-gateway__keystone-arch" aria-hidden>
        <svg viewBox="0 0 900 280" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMin meet">
          <defs>
            <linearGradient id="portal-arch-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F8F4E8" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#D4AF37" stopOpacity="1" />
              <stop offset="100%" stopColor="#7A5C10" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <path ref={(el) => { archPathRefs.current[0] = el; }} d="M4 268 L4 68 Q 4 2, 450 2 Q 896 2, 896 68 L 896 268" stroke="url(#portal-arch-gold)" strokeWidth="5" />
          <path ref={(el) => { archPathRefs.current[1] = el; }} d="M36 268 L36 88 Q 36 24, 450 24 Q 864 24, 864 88 L 864 268" stroke="#C9A227" strokeWidth="2.5" strokeOpacity="0.65" />
          <path ref={(el) => { archPathRefs.current[2] = el; }} d="M68 268 L68 104 Q 68 48, 450 48 Q 832 48, 832 104 L 832 268" stroke="#D4AF37" strokeWidth="1.4" strokeOpacity="0.45" />
          <ellipse cx="450" cy="30" rx="42" ry="18" fill="#D4AF37" fillOpacity="0.16" stroke="#C9A227" strokeWidth="1.4" />
          <path d="M120 72 Q 200 36, 280 72 M620 72 Q 700 36, 780 72" stroke="#C9A227" strokeWidth="0.9" strokeOpacity="0.55" />
          <path d="M200 108 Q 260 88, 320 108 M580 108 Q 640 88, 700 108" stroke="#D4AF37" strokeWidth="0.7" strokeOpacity="0.45" />
          <path d="M340 268 L340 172 M560 268 L560 172 M260 268 L260 196 M640 268 L640 196" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.4" />
        </svg>
      </div>

      <div className="royal-signin-gateway__torch royal-signin-gateway__torch--left" aria-hidden>
        <div className="royal-signin-gateway__torch-basket" />
        <div className="royal-signin-gateway__torch-flame" />
      </div>
      <div className="royal-signin-gateway__torch royal-signin-gateway__torch--right" aria-hidden>
        <div className="royal-signin-gateway__torch-basket" />
        <div className="royal-signin-gateway__torch-flame" />
      </div>

      <div className="royal-signin-gateway__pillar royal-signin-gateway__pillar--left" aria-hidden>
        <div className="royal-signin-gateway__pillar-cap" />
        <div className="royal-signin-gateway__pillar-shaft">
          <div className="royal-signin-gateway__pillar-carving" />
        </div>
        <div className="royal-signin-gateway__pillar-base" />
      </div>

      <div className="royal-signin-gateway__pillar royal-signin-gateway__pillar--right" aria-hidden>
        <div className="royal-signin-gateway__pillar-cap" />
        <div className="royal-signin-gateway__pillar-shaft">
          <div className="royal-signin-gateway__pillar-carving" />
        </div>
        <div className="royal-signin-gateway__pillar-base" />
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
                <div className="royal-signin-portal-door__emblem" />
                <div className="royal-signin-portal-door__carving" />
              </div>
              <div className="royal-signin-portal-door__ring" />
            </div>
            <div className="royal-signin-portal-door royal-signin-portal-door--right">
              <div className="royal-signin-portal-door__panel">
                <div className="royal-signin-portal-door__emblem" />
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

      <div className="royal-signin-gateway__threshold" aria-hidden />
      <div className="royal-signin-gateway__breath" aria-hidden />
    </form>
  );
}
