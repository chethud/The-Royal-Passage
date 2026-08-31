import { useEffect, useMemo, useState } from "react";
import { useAuthUser } from "@/lib/auth-user";
import {
  syncGuestContactDetails,
  validateGuestContact,
  type GuestContactDetails,
} from "@/lib/guest-contact";
import { sanitizeTenDigitPhoneInput } from "@/lib/phone";

function buildContactFromAuth(
  user: NonNullable<ReturnType<typeof useAuthUser>["user"]>,
  profile: ReturnType<typeof useAuthUser>["profile"],
): GuestContactDetails {
  const meta = user.user_metadata ?? {};
  return {
    fullName:
      profile?.fullName?.trim() ??
      (meta.full_name as string | undefined)?.trim() ??
      (meta.name as string | undefined)?.trim() ??
      "",
    email: user.email?.trim() ?? "",
    phone: sanitizeTenDigitPhoneInput(
      profile?.phone ?? (meta.phone as string | undefined) ?? user.phone ?? "",
    ),
  };
}

export function useGuestContactDetails() {
  const { user, profile } = useAuthUser();
  const [contact, setContact] = useState<GuestContactDetails>({
    fullName: "",
    email: "",
    phone: "",
  });
  const [hydrated, setHydrated] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!user) {
      setHydrated(false);
      return;
    }
    setContact(buildContactFromAuth(user, profile));
    setHydrated(true);
  }, [user, profile]);

  const validationError = useMemo(() => validateGuestContact(contact), [contact]);
  const isValid = validationError === null;

  const syncToProfile = async () => {
    setShowErrors(true);
    await syncGuestContactDetails(contact);
  };

  return {
    contact,
    setContact,
    hydrated,
    isValid,
    validationError,
    showErrors,
    setShowErrors,
    syncToProfile,
  };
}
