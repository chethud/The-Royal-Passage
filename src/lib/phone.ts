/** Digits-only mobile input, capped at 10. Strips +91 / leading 0 when pasted. */
export function sanitizeTenDigitPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length >= 12) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

/** Returns exactly 10 digits, or null if incomplete / invalid. */
export function normalizeTenDigitPhone(value: string): string | null {
  const digits = sanitizeTenDigitPhoneInput(value);
  return digits.length === 10 ? digits : null;
}

export function isTenDigitPhone(value: string): boolean {
  return normalizeTenDigitPhone(value) !== null;
}

/** Shared HTML attributes for 10-digit mobile inputs. */
export const TEN_DIGIT_PHONE_INPUT_PROPS = {
  type: "tel" as const,
  inputMode: "numeric" as const,
  autoComplete: "tel-national" as const,
  maxLength: 10,
  pattern: "[0-9]{10}",
  title: "Enter a 10-digit mobile number",
  placeholder: "10-digit mobile number",
};
