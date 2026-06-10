import { useCallback, useRef, useState } from "react";

export type RoyalSignInPhase =
  | "idle"
  | "seal"
  | "activation"
  | "ready"
  | "dissolve"
  | "doors-reveal"
  | "doors-open"
  | "forward"
  | "courtyard"
  | "particles"
  | "logo"
  | "unfold"
  | "done";

/** Stages 4–9: triggered when the user signs in (form already lit). */
const SEQUENCE: RoyalSignInPhase[] = [
  "dissolve",
  "doors-reveal",
  "doors-open",
  "forward",
  "courtyard",
  "particles",
  "logo",
  "unfold",
];

/** Stages 1–3: cinematic intro that auto-plays on page load and rests at "ready". */
const INTRO_SEQUENCE: RoyalSignInPhase[] = ["seal", "activation", "ready"];

/** Durations aligned to storyboard timeline (ms). */
const DURATIONS: Record<Exclude<RoyalSignInPhase, "idle" | "ready" | "done">, number> = {
  seal: 1800,
  activation: 2200,
  dissolve: 900,
  "doors-reveal": 1600,
  "doors-open": 2400,
  forward: 3200,
  courtyard: 1800,
  particles: 1800,
  logo: 1200,
  unfold: 1800,
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
        const id = window.setTimeout(
          runStep,
          DURATIONS[step as Exclude<RoyalSignInPhase, "idle" | "ready" | "done">],
        );
        timersRef.current.push(id);
      };

      runStep();
    },
    [clearTimers, reducedMotion],
  );

  /** Auto-play the on-load intro (Stages 1–3) and rest at "ready". */
  const intro = useCallback(() => {
    clearTimers();
    if (reducedMotion) {
      setPhase("ready");
      return;
    }

    let index = 0;
    const runStep = () => {
      const step = INTRO_SEQUENCE[index];
      if (!step) return;
      setPhase(step);
      index += 1;
      if (step === "ready") return; // rest here, waiting for sign-in
      const id = window.setTimeout(runStep, DURATIONS[step as Exclude<RoyalSignInPhase, "idle" | "ready" | "done">]);
      timersRef.current.push(id);
    };

    // brief beat so the form fades in (Stage 1) before it glows (Stage 2)
    const id = window.setTimeout(runStep, 500);
    timersRef.current.push(id);
  }, [clearTimers, reducedMotion]);

  const reset = useCallback(() => {
    clearTimers();
    setPhase("idle");
  }, [clearTimers]);

  return {
    phase,
    start,
    intro,
    reset,
    // "ready" is a resting state — not a blocking animation
    isAnimating: phase !== "idle" && phase !== "ready" && phase !== "done",
  };
}
