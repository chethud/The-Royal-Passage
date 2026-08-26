import { majorToMinor, minorToMajor } from "@/lib/money";

export type ExperiencePartyKind = "solo" | "group";

export function isFixedGroupBooking(minGuests: number, maxGuests: number) {
  return minGuests > 1 && minGuests === maxGuests;
}

export function inferExperiencePartyKind(minGuests: number, maxGuests: number): ExperiencePartyKind {
  return isFixedGroupBooking(minGuests, maxGuests) ? "group" : "solo";
}

export function perPersonMinorFromGroupTotal(totalMajor: number, members: number) {
  if (members < 1) return 0;
  const totalMinor = majorToMinor(totalMajor);
  return Math.round(totalMinor / members);
}

export function groupTotalMajorFromPerPersonMinor(perPersonMinor: number, members: number) {
  return Math.round(minorToMajor(perPersonMinor * members));
}

type ResolvePartyPricingInput = {
  partyKind: ExperiencePartyKind | null;
  priceMajor: number;
  maxGuests: number;
  groupMembers: number;
  groupTotalMajor: number;
  requirePositivePrice?: boolean;
};

type ResolvePartyPricingResult =
  | { ok: false; error: string }
  | {
      ok: true;
      pricePerPersonMinor: number;
      minGuests: number;
      maxGuests: number;
    };

export function resolveExperiencePartyPricing(
  input: ResolvePartyPricingInput,
): ResolvePartyPricingResult {
  if (!input.partyKind) {
    return { ok: false, error: "Choose whether this experience is solo or a group." };
  }

  if (input.partyKind === "solo") {
    if (!Number.isFinite(input.priceMajor) || input.priceMajor < 0) {
      return { ok: false, error: "Price cannot be negative." };
    }
    if (input.requirePositivePrice && input.priceMajor <= 0) {
      return { ok: false, error: "Enter a price per person." };
    }
    const maxGuests = Number.isFinite(input.maxGuests) ? input.maxGuests : 0;
    if (maxGuests < 1 || maxGuests > 50) {
      return { ok: false, error: "Max guests must be between 1 and 50." };
    }
    return {
      ok: true,
      pricePerPersonMinor: majorToMinor(input.priceMajor),
      minGuests: 1,
      maxGuests,
    };
  }

  if (!Number.isFinite(input.groupMembers) || input.groupMembers < 2 || input.groupMembers > 50) {
    return { ok: false, error: "Group size must be between 2 and 50 members." };
  }
  if (!Number.isFinite(input.groupTotalMajor) || input.groupTotalMajor < 0) {
    return { ok: false, error: "Group price cannot be negative." };
  }
  if (input.requirePositivePrice && input.groupTotalMajor <= 0) {
    return { ok: false, error: "Enter the total group price." };
  }

  return {
    ok: true,
    pricePerPersonMinor: perPersonMinorFromGroupTotal(input.groupTotalMajor, input.groupMembers),
    minGuests: input.groupMembers,
    maxGuests: input.groupMembers,
  };
}
