import type { RoyalSignInPhase } from "@/hooks/use-royal-sign-in-animation";

const POST_DISSOLVE: RoyalSignInPhase[] = [
  "dissolve",
  "doors-reveal",
  "doors-open",
  "forward",
  "courtyard",
  "particles",
  "logo",
  "unfold",
  "done",
];

const POST_DOORS_OPEN: RoyalSignInPhase[] = [
  "doors-open",
  "forward",
  "courtyard",
  "particles",
  "logo",
  "unfold",
  "done",
];

export function getRoyalSignInPhaseFlags(phase: RoyalSignInPhase) {
  return {
    showForm: phase === "idle" || phase === "seal" || phase === "activation" || phase === "dissolve",
    sealActive: phase === "seal",
    activationActive: phase === "activation" || POST_DISSOLVE.includes(phase),
    archLit: phase !== "idle",
    formGlowing: phase === "seal" || phase === "activation",
    formDissolving: phase === "dissolve",
    showDoors: POST_DISSOLVE.includes(phase),
    doorsRevealing: POST_DISSOLVE.includes(phase),
    doorsOpen: POST_DOORS_OPEN.includes(phase),
    doorsUnlocking: phase === "doors-reveal",
    cameraForward: ["forward", "courtyard", "particles", "logo", "unfold", "done"].includes(phase),
    showCourtyard: ["courtyard", "particles", "logo", "unfold", "done"].includes(phase),
    showTrail: ["particles", "logo", "unfold"].includes(phase),
    logoGlow: ["logo", "unfold"].includes(phase),
    logoPulse: phase === "logo",
    unfolding: phase === "unfold",
    showDissolveParticles: phase === "dissolve",
    showSealRings: phase === "seal",
  };
}
