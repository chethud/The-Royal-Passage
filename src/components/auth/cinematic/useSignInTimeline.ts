import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import type { SignInCinematicPhase } from "@/components/auth/cinematic/types";
import { SIGN_IN_PHASE_MS } from "@/components/auth/cinematic/types";

const PHASE_ORDER: SignInCinematicPhase[] = [
  "entrance",
  "reveal",
  "opening",
  "portal",
  "ready",
];

export function useSignInTimeline(skip = false) {
  const reduceMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<SignInCinematicPhase>(
    reduceMotion || skip ? "ready" : "entrance",
  );

  useEffect(() => {
    if (reduceMotion || skip) {
      setPhase("ready");
      return;
    }

    let index = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const advance = () => {
      const next = PHASE_ORDER[index + 1];
      if (!next) return;
      index += 1;
      setPhase(next);
      if (next !== "ready") {
        timer = setTimeout(advance, SIGN_IN_PHASE_MS[next]);
      }
    };

    timer = setTimeout(advance, SIGN_IN_PHASE_MS.entrance);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [reduceMotion, skip]);

  const phaseIndex = PHASE_ORDER.indexOf(phase);
  const isInteractive = phase === "ready" || phase === "portal";

  return { phase, phaseIndex, isInteractive, reduceMotion };
}
