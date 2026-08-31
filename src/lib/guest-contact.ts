import { updateAccountProfile } from "@/lib/profile-browser";
import { normalizeTenDigitPhone } from "@/lib/phone";

export type GuestContactDetails = {
  fullName: string;
  email: string;
  phone: string;
};

export function validateGuestContact(contact: GuestContactDetails): string | null {
  const fullName = contact.fullName.trim();
  if (fullName.length < 2) {
    return "Enter your full name.";
  }

  const email = contact.email.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email address.";
  }

  if (!normalizeTenDigitPhone(contact.phone)) {
    return "Enter a valid 10-digit mobile number.";
  }

  return null;
}

export async function syncGuestContactDetails(contact: GuestContactDetails): Promise<void> {
  const validationError = validateGuestContact(contact);
  if (validationError) {
    throw new Error(validationError);
  }

  await updateAccountProfile({
    fullName: contact.fullName.trim(),
    phone: normalizeTenDigitPhone(contact.phone)!,
  });
}
