import { lazy, Suspense, type ReactNode } from "react";
import heroPalaceImg from "@/assets/hero-image.png";
import { RoyalPalaceGateway } from "@/components/auth/RoyalPalaceGateway";
import type { SignInCinematicPhase } from "@/components/auth/cinematic/types";

const DustParticleCanvas = lazy(() =>
  import("@/components/auth/cinematic/DustParticleCanvas").then((m) => ({
    default: m.DustParticleCanvas,
  })),
);

type PalacePhaseProps = {
  phase: SignInCinematicPhase;
};

/** Fixed palace photograph — stays behind the login passport at all times. */
export function PalaceBackdrop({ phase }: PalacePhaseProps) {
  const forward = phase !== "entrance";
  const loginVisible = phase === "portal" || phase === "ready";
  const softFocus = phase === "opening" || loginVisible;

  return (
    <div
      className={[
        "royal-signin-bg royal-signin-bg--fixed",
        forward ? "is-forward" : "",
        loginVisible ? "is-login" : "",
        softFocus ? "is-soft-focus" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <img
        src={heroPalaceImg}
        alt=""
        className="royal-signin-bg-img h-full w-full object-cover"
        decoding="async"
        fetchPriority="high"
      />
      <div className="royal-signin-fog pointer-events-none absolute inset-0" />
      <div className="royal-signin-godrays pointer-events-none absolute inset-0" />
      <div className="royal-signin-rays pointer-events-none absolute inset-0" />
      <div className="royal-signin-sunset pointer-events-none absolute inset-0" />
      <div className="royal-signin-chandelier-glow pointer-events-none absolute inset-0" />
      <div
        className={[
          "royal-signin-bg-vignette absolute inset-0",
          loginVisible ? "royal-signin-bg-vignette--login" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />
      <div className="royal-signin-bloom pointer-events-none absolute inset-0" />
      <Suspense fallback={null}>
        <DustParticleCanvas dimmed={softFocus} />
      </Suspense>
    </div>
  );
}

export function PalaceGatewayLayer({ phase }: PalacePhaseProps) {
  if (phase !== "entrance") return null;

  return (
    <div className="royal-signin-gateway-wrap">
      <RoyalPalaceGateway />
    </div>
  );
}

export function CinematicParallaxLayer({
  phase,
  children,
}: {
  phase: SignInCinematicPhase;
  children: ReactNode;
}) {
  const forward = phase !== "entrance";
  const courtyard = phase === "reveal" || phase === "opening";

  return (
    <div
      className={[
        "royal-signin-scene",
        forward ? "is-forward" : "",
        courtyard ? "is-courtyard" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
