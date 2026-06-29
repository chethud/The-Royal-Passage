export type SignInCinematicPhase =
  | "entrance"
  | "reveal"
  | "opening"
  | "portal"
  | "ready";

export const SIGN_IN_PHASE_MS: Record<SignInCinematicPhase, number> = {
  entrance: 1500,
  reveal: 1500,
  opening: 1500,
  portal: 1500,
  ready: 0,
};
