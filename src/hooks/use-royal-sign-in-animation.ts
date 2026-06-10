import { useCallback, useRef, useState } from "react";

export type RoyalSignInPhase =
  | "idle"
  | "seal"
  | "activation"
  | "dissolve"
  | "doors-reveal"
  | "doors-open"
  | "forward"
  | "courtyard"
  | "particles"
  | "logo"
  | "unfold"
  | "done";

const SEQUENCE: RoyalSignInPhase[] = [
  "seal",
  "activation",
  "dissolve",
  "doors-reveal",
  "doors-open",
  "forward",
  "courtyard",
  "particles",
  "logo",
  "unfold",
];

/** Durations aligned to storyboard timeline (ms). */
const DURATIONS: Record<Exclude<RoyalSignInPhase, "idle" | "done">, number> = {
  seal: 1000,
  activation: 1500,
  dissolve: 1200,
  "doors-reveal": 2000,
  "doors-open": 3000,
  forward: 4000,
  courtyard: 2000,
  particles: 2000,
  logo: 1500,
  unfold: 2000,
};

export function useRoyalSignInAnimation(reducedMotion: boolean) {
  const [phase, setPhase] = useState<RoyalSignInPhase>("idle");
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const start = useCallback(
    (onComplete: () => void) => {
      clearTimers();
      if (reducedMotion) {
        setPhase("done");
        onComplete();
        return;
      }

      let index = 0;
      const runStep = () => {
        const step = SEQUENCE[index];
        if (!step) {
          setPhase("done");
          onComplete();
          return;
        }
        setPhase(step);
        index += 1;
        const id = window.setTimeout(runStep, DURATIONS[step]);
        timersRef.current.push(id);
      };

      runStep();
    },
    [clearTimers, reducedMotion],
  );

  const reset = useCallback(() => {
    clearTimers();
    setPhase("idle");
  }, [clearTimers]);

  return { phase, start, reset, isAnimating: phase !== "idle" && phase !== "done" };
}
