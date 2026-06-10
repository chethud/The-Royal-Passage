import { useCallback, useRef, useState } from "react";

export type RoyalSignInPhase =
  | "idle"
  | "glow"
  | "arch"
  | "dissolve"
  | "doors"
  | "forward"
  | "particles"
  | "logo"
  | "unfold"
  | "done";

const SEQUENCE: RoyalSignInPhase[] = [
  "glow",
  "arch",
  "dissolve",
  "doors",
  "forward",
  "particles",
  "logo",
  "unfold",
];

const DURATIONS: Record<Exclude<RoyalSignInPhase, "idle" | "done">, number> = {
  glow: 650,
  arch: 750,
  dissolve: 700,
  doors: 1500,
  forward: 1800,
  particles: 2200,
  logo: 1100,
  unfold: 1300,
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
