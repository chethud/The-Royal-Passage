import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import logoUrl from "@/assets/logo/logo.png";
import {
  CinematicParallaxLayer,
  PalaceBackdrop,
  PalaceGatewayLayer,
} from "@/components/auth/cinematic/PalaceEnvironment";
import { SignInPassportBook } from "@/components/auth/cinematic/SignInPassportBook";
import { useSignInTimeline } from "@/components/auth/cinematic/useSignInTimeline";
import type { SignInCinematicPhase } from "@/components/auth/cinematic/types";

const softEase = [0.22, 1, 0.36, 1] as const;

type RoyalCinematicSignInProps = {
  children: ReactNode;
  /** Skip intro when user returns or prefers immediate access */
  skipIntro?: boolean;
};

function phaseDataAttr(phase: SignInCinematicPhase) {
  return phase;
}

export function RoyalCinematicSignIn({ children, skipIntro = false }: RoyalCinematicSignInProps) {
  const { phase, isInteractive, reduceMotion } = useSignInTimeline(skipIntro);
  const showPassport = phase !== "entrance";

  return (
    <div
      className={[
        "royal-signin-page",
        "royal-signin-page--cinematic",
        `royal-signin-page--${phase}`,
      ].join(" ")}
      data-phase={phaseDataAttr(phase)}
    >
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

      <PalaceBackdrop phase={phase} />

      <CinematicParallaxLayer phase={phase}>
        <PalaceGatewayLayer phase={phase} />

        <div className="royal-signin-stage relative z-10 flex min-h-[100dvh] items-center justify-center px-[2vw] pt-[4vh] pb-[3vh]">
          {showPassport ? (
            <SignInPassportBook phase={phase} reduceMotion={reduceMotion}>
              <motion.div
                className="royal-signin-auth-portal"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: isInteractive || phase === "portal" ? 1 : 0.35 }}
                transition={{ duration: 0.9, ease: softEase }}
                aria-hidden={!isInteractive && phase !== "portal"}
              >
                {children}
              </motion.div>
            </SignInPassportBook>
          ) : (
            <motion.p
              className="royal-signin-entrance-verse"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: softEase }}
            >
              Present your credentials before the royal archive
            </motion.p>
          )}
        </div>
      </CinematicParallaxLayer>
    </div>
  );
}
