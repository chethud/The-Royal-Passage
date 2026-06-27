/** Fallback when DB migration has not assigned a registration number yet. */
export function registrationNumberFromId(id: string): string {
  const digits = id.replace(/\D/g, "");
  if (digits.length >= 7) return digits.slice(0, 7);
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 10_000_000;
  }
  return String(hash).padStart(7, "0");
}

export function resolveRegistrationNumber(profile: {
  id: string;
  registrationNumber?: string | null;
}): string {
  const stored = profile.registrationNumber?.trim();
  if (stored) return stored;
  return registrationNumberFromId(profile.id);
}
