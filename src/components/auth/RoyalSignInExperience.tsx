import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import heroPalaceImg from "@/assets/hero-image.png";
import logoUrl from "@/assets/logo/logo.png";

type RoyalSignInExperienceProps = {
  portal: ReactNode;
};

export function RoyalSignInExperience({ portal }: RoyalSignInExperienceProps) {
  return (
    <div className="royal-signin-page">
      <Link
        to="/"
        className="royal-signin-logo fixed top-5 left-5 z-[80] sm:top-6 sm:left-8"
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

      <div className="royal-signin-scene">
        <div className="royal-signin-bg absolute inset-0">
          <img src={heroPalaceImg} alt="" className="royal-signin-bg-img h-full w-full object-cover" decoding="async" />
          <div className="royal-signin-bg-vignette absolute inset-0" aria-hidden />
        </div>

        <div className="royal-signin-atmosphere pointer-events-none absolute inset-0" aria-hidden>
          <div className="royal-signin-fog absolute inset-0" />
          <div className="royal-signin-rays absolute inset-0" />
          <div className="royal-signin-chandelier-glow absolute inset-x-0 top-0 h-56" />
          <div className="royal-signin-sunset absolute inset-0" />
          <div className="royal-signin-godrays absolute inset-0" />
        </div>

        <div className="royal-signin-stage relative z-10 flex min-h-[100dvh] items-center justify-center px-[1vw] pt-[3vh] pb-[1.5vh]">
          {portal}
        </div>
      </div>
    </div>
  );
}
</div>
    </div>
  );
}
