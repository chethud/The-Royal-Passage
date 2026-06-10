import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import heroPalaceImg from "@/assets/hero-image.png";
import logoUrl from "@/assets/logo/logo.png";
import { MaharajaEmblem } from "@/components/site/RoyalHeritageDecor";
import type { RoyalSignInPhase } from "@/hooks/use-royal-sign-in-animation";

type RoyalSignInExperienceProps = {
  phase: RoyalSignInPhase;
  children: ReactNode;
};

const TRAIL_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  delay: i * 0.055,
  size: 3 + (i % 2),
}));

function RoyalArch() {
  return (
    <svg
      className="royal-signin-arch-svg h-full w-full"
      viewBox="0 0 520 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M40 400 L40 180 Q 40 40, 260 40 Q 480 40, 480 180 L 480 400"
        stroke="#D4AF37"
        strokeWidth="2"
        strokeOpacity="0.7"
      />
      <path
        d="M70 400 L70 200 Q 70 70, 260 70 Q 450 70, 450 200 L 450 400"
        stroke="#C9A227"
        strokeWidth="1.2"
        strokeOpacity="0.45"
      />
      <path d="M40 400 L480 400" stroke="#D4AF37" strokeWidth="1.5" strokeOpacity="0.5" />
      <rect x="95" y="400" width="28" height="18" fill="#3B0000" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.5" />
      <rect x="397" y="400" width="28" height="18" fill="#3B0000" stroke="#D4AF37" strokeWidth="0.8" strokeOpacity="0.5" />
      <circle cx="260" cy="52" r="8" fill="#D4AF37" fillOpacity="0.35" stroke="#C9A227" strokeWidth="0.8" />
      <path d="M200 400 L200 240 M320 400 L320 240" stroke="#D4AF37" strokeWidth="0.6" strokeOpacity="0.35" />
    </svg>
  );
}

export function RoyalSignInExperience({ phase, children }: RoyalSignInExperienceProps) {
  const showForm = phase === "idle" || phase === "glow" || phase === "arch";
  const archLit = phase !== "idle";
  const showDoors = ["dissolve", "doors", "forward", "particles", "logo", "unfold", "done"].includes(phase);
  const doorsOpen = ["doors", "forward", "particles", "logo", "unfold", "done"].includes(phase);
  const cameraForward = ["forward", "particles", "logo", "unfold", "done"].includes(phase);
  const showTrail = ["particles", "logo", "unfold"].includes(phase);
  const logoGlow = ["logo", "unfold"].includes(phase);
  const unfolding = phase === "unfold";

  return (
    <div className={`royal-signin-page ${phase !== "idle" ? `royal-signin-page--${phase}` : ""}`} data-phase={phase}>
      <Link
        to="/"
        className={`royal-signin-logo fixed top-5 left-5 z-[80] sm:top-6 sm:left-8 ${logoGlow ? "is-glowing" : ""} ${unfolding ? "is-settled" : ""}`}
        aria-label="The Royal Passage — Home"
      >
        <img
          src={logoUrl}
          alt="The Royal Passage"
          width={320}
          height={110}
          decoding="async"
          className="h-11 w-auto object-contain object-left sm:h-14 md:h-16"
        />
        <MaharajaEmblem className="royal-signin-logo-emblem pointer-events-none absolute -top-1 -right-2 h-5 w-5 opacity-0" />
      </Link>

      <div className={`royal-signin-scene ${cameraForward ? "is-forward" : ""}`}>
        <div className="royal-signin-bg absolute inset-0">
          <img src={heroPalaceImg} alt="" className="royal-signin-bg-img h-full w-full object-cover" decoding="async" />
          <div className="royal-signin-bg-vignette absolute inset-0" aria-hidden />
        </div>

        <div className="royal-signin-atmosphere pointer-events-none absolute inset-0" aria-hidden>
          <div className="royal-signin-fog absolute inset-0" />
          <div className="royal-signin-rays absolute inset-0" />
        </div>

        <div className="royal-signin-dust pointer-events-none absolute inset-0" aria-hidden>
          {TRAIL_PARTICLES.map((p) => (
            <span
              key={`dust-${p.id}`}
              className="royal-signin-dust-mote absolute rounded-full bg-[#D4AF37]"
              style={{
                left: `${12 + p.id * 5.5}%`,
                top: `${18 + ((p.id * 13) % 60)}%`,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="royal-signin-stage relative z-10 flex min-h-[100dvh] items-center justify-center px-4 pt-24 pb-12 sm:px-6">
          <div className={`royal-signin-arch-wrap relative z-30 w-full max-w-[36rem] ${archLit ? "is-lit" : ""}`}>
            <div className="royal-signin-torches pointer-events-none absolute -left-5 top-[38%] z-20 h-20 w-3 sm:-left-10" aria-hidden />
            <div className="royal-signin-torches pointer-events-none absolute -right-5 top-[38%] z-20 h-20 w-3 sm:-right-10" aria-hidden />

            <div className="royal-signin-arch-frame relative aspect-[520/420] w-full min-h-[280px] sm:min-h-[340px]">
              <RoyalArch />

              <div
                className={`royal-signin-card-wrap absolute inset-0 z-20 flex items-center justify-center px-6 py-14 sm:px-10 sm:py-16 ${
                  showForm ? "is-visible" : "is-hidden"
                } ${phase === "glow" || phase === "arch" ? "is-glowing" : ""} ${phase === "dissolve" ? "is-dissolving" : ""}`}
              >
                <div className="royal-signin-card w-full max-w-[19rem] sm:max-w-sm">{children}</div>
              </div>
            </div>
          </div>

          {showDoors ? (
            <div className={`royal-signin-doors pointer-events-none absolute inset-0 z-40 ${doorsOpen ? "is-open" : ""}`}>
              <div className="royal-signin-door royal-signin-door--left" />
              <div className="royal-signin-door royal-signin-door--right" />
            </div>
          ) : null}

          {showDoors ? (
            <div className={`royal-signin-burst pointer-events-none absolute inset-0 z-[35] ${doorsOpen ? "is-active" : ""}`} aria-hidden />
          ) : null}
        </div>

        {showTrail ? (
          <div className="royal-signin-trail pointer-events-none absolute inset-0 z-[70]" aria-hidden>
            {TRAIL_PARTICLES.map((p) => (
              <span
                key={`trail-${p.id}`}
                className="royal-signin-trail-particle absolute rounded-full bg-[#D4AF37]"
                style={{
                  width: p.size + 1,
                  height: p.size + 1,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>
        ) : null}

        <div className={`royal-signin-unfold pointer-events-none absolute inset-0 z-[75] ${unfolding ? "is-active" : ""}`} aria-hidden />
      </div>
    </div>
  );
}
