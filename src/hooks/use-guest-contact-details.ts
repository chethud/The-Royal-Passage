import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthUser } from "@/lib/auth-user";
import {
  syncGuestContactDetails,
  validateGuestContact,
  type GuestContactDetails,
} from "@/lib/guest-contact";
import { sanitizeTenDigitPhoneInput } from "@/lib/phone";

const EMPTY_CONTACT: GuestContactDetails = {
  fullName: "",
  email: "",
  phone: "",
};

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

type UseGuestContactDetailsOptions = {
  /** Travel agents enter customer details — do not pre-fill from the signed-in agent profile. */
  forCustomerEntry?: boolean;
};

export function useGuestContactDetails(options: UseGuestContactDetailsOptions = {}) {
  const { forCustomerEntry = false } = options;
  const { user, profile } = useAuthUser();
  const [contact, setContact] = useState<GuestContactDetails>(EMPTY_CONTACT);
  const [hydrated, setHydrated] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      initializedRef.current = false;
      setHydrated(false);
      return;
    }

    if (forCustomerEntry) {
      if (!initializedRef.current) {
        setContact(EMPTY_CONTACT);
        initializedRef.current = true;
      }
      setHydrated(true);
      return;
    }

    setContact(buildContactFromAuth(user, profile));
    setHydrated(true);
    initializedRef.current = true;
  }, [forCustomerEntry, user, profile]);

  const validationError = useMemo(() => validateGuestContact(contact), [contact]);
  const isValid = validationError === null;

  const syncToProfile = async () => {
    setShowErrors(true);
    if (forCustomerEntry) return;
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
