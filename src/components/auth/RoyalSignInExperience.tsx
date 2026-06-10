import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import heroPalaceImg from "@/assets/hero-image.png";
import logoUrl from "@/assets/logo/logo.png";
import { RoyalParticleCanvas } from "@/components/auth/RoyalParticleCanvas";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { RoyalSignInPhase } from "@/hooks/use-royal-sign-in-animation";
import { getRoyalSignInPhaseFlags } from "@/lib/royal-sign-in-phase";

type RoyalSignInExperienceProps = {
  phase: RoyalSignInPhase;
  portal: ReactNode;
};

export function RoyalSignInExperience({ phase, portal }: RoyalSignInExperienceProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { cameraForward, showCourtyard, logoGlow, logoPulse, unfolding } =
    getRoyalSignInPhaseFlags(phase);

  return (
    <div className={`royal-signin-page ${phase !== "idle" ? `royal-signin-page--${phase}` : ""}`} data-phase={phase}>
      <Link
        to="/"
        className={`royal-signin-logo fixed top-5 left-5 z-[80] sm:top-6 sm:left-8 ${logoGlow ? "is-glowing" : ""} ${logoPulse ? "is-pulsing" : ""} ${unfolding ? "is-settled" : ""}`}
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
      </Link>

      <div
        className={`royal-signin-scene ${cameraForward ? "is-forward" : ""} ${showCourtyard ? "is-courtyard" : ""}`}
      >
        <div className="royal-signin-bg absolute inset-0">
          <img src={heroPalaceImg} alt="" className="royal-signin-bg-img h-full w-full object-cover" decoding="async" />
          <div className="royal-signin-bg-vignette absolute inset-0" aria-hidden />
        </div>

        <div className="royal-signin-courtyard-layer pointer-events-none absolute inset-0" aria-hidden>
          <img src={heroPalaceImg} alt="" className="royal-signin-courtyard-img h-full w-full object-cover" decoding="async" />
          <div className="royal-signin-courtyard-glow absolute inset-0" />
        </div>

        <div className="royal-signin-atmosphere pointer-events-none absolute inset-0" aria-hidden>
          <div className="royal-signin-fog absolute inset-0" />
          <div className="royal-signin-rays absolute inset-0" />
          <div className="royal-signin-chandelier-glow absolute inset-x-0 top-0 h-56" />
          <div className="royal-signin-sunset absolute inset-0" />
          <div className="royal-signin-godrays absolute inset-0" />
        </div>

        <div className="royal-signin-stage relative z-10 flex min-h-[100dvh] items-center justify-center px-[1.5vw] pt-[4rem] pb-[1.5vh]">
          {portal}
        </div>

        <RoyalParticleCanvas phase={phase} reducedMotion={reducedMotion} />

        <div className={`royal-signin-unfold pointer-events-none absolute inset-0 z-[75] ${unfolding ? "is-active" : ""}`} aria-hidden>
          <div className="royal-signin-unfold__crest-burst" />
          <nav className="royal-signin-unfold__nav" aria-hidden>
            <span>Home</span>
            <span>Destinations</span>
            <span>Experiences</span>
            <span>Journal</span>
            <span>Contact</span>
          </nav>
          <div className="royal-signin-unfold__hero" aria-hidden>
            <p className="royal-signin-unfold__eyebrow">The Royal Passage</p>
            <h2 className="royal-signin-unfold__title">Discover the Royal Legacy of Mysuru</h2>
            <span className="royal-signin-unfold__cta">Explore Now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
