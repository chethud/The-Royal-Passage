const SIGNUP_PENDING_PREFIX = "rp_vip_signup_prompt_pending:";
const DISMISSED_PREFIX = "rp_vip_prompt_dismissed:";

function signupPendingKey(userId: string) {
  return `${SIGNUP_PENDING_PREFIX}${userId}`;
}

function dismissedKey(userId: string) {
  return `${DISMISSED_PREFIX}${userId}`;
}

export function markVipSignupPromptPending(userId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(signupPendingKey(userId), "1");
}

export function hasVipSignupPromptPending(userId: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(signupPendingKey(userId)) === "1";
}

export function hasVipPromptDismissed(userId: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(dismissedKey(userId)) === "1";
}

export function markVipPromptDismissed(userId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(dismissedKey(userId), "1");
  window.localStorage.removeItem(signupPendingKey(userId));
}

export function isRecentGuestAccount(createdAt: string | null | undefined): boolean {
  if (!createdAt) return false;
  const createdMs = Date.parse(createdAt);
  if (Number.isNaN(createdMs)) return false;
  const hoursSinceSignup = (Date.now() - createdMs) / (1000 * 60 * 60);
  return hoursSinceSignup <= 48;
}
