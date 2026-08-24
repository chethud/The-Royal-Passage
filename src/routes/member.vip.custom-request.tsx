import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { useAuthUser } from "@/lib/auth-user";
import { isApprovedVipMember, submitVipCustomPackageRequest } from "@/lib/api/vip-membership";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import {
  minVipTravelFromDate,
  normalizeVipTravelDates,
  VIP_MIN_ADVANCE_DAYS,
} from "@/lib/vip-filters";
import { dashboardPathForRole, isGuestAccount } from "@/lib/roles";
import { NOINDEX_META } from "@/lib/seo-helpers";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";
import { normalizeTenDigitPhone, sanitizeTenDigitPhoneInput, TEN_DIGIT_PHONE_INPUT_PROPS } from "@/lib/phone";

const inputClass =
  "w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body focus:border-[#4A0000]/50 focus:outline-none focus:ring-1 focus:ring-[#4A0000]/25";

export const Route = createFileRoute("/member/vip/custom-request")({
  head: () => ({
    meta: [{ title: "Custom VIP package — The Royal Passage" }, ...NOINDEX_META],
  }),
  component: MemberVipCustomRequestPage,
});

function MemberVipCustomRequestPage() {
  const navigate = useNavigate();
  const { user, role, loading, accessToken, profile, vipMembershipStatus } = useAuthUser();
  const minDate = minVipTravelFromDate();
  const [travelStart, setTravelStart] = useState(minDate);
  const [travelEnd, setTravelEnd] = useState(minDate);
  const [guestCount, setGuestCount] = useState(2);
  const [preferences, setPreferences] = useState("");
  const [guestPhone, setGuestPhone] = useState(() => sanitizeTenDigitPhoneInput(profile?.phone ?? ""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      void navigate({ to: "/sign-in" });
      return;
    }
    if (!isGuestAccount(role)) {
      void navigate({ to: dashboardPathForRole(role) });
      return;
    }
    if (!isApprovedVipMember(vipMembershipStatus)) {
      void navigate({ to: "/experiences" });
    }
  }, [loading, navigate, role, user, vipMembershipStatus]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      if (guestPhone.trim() && !normalizeTenDigitPhone(guestPhone)) {
        throw new Error("Enter a valid 10-digit mobile number.");
      }
      const dates = normalizeVipTravelDates(travelStart, travelEnd);
      await submitVipCustomPackageRequest(accessToken, {
        travelStart: dates.start,
        travelEnd: dates.end,
        guestCount,
        preferences: preferences.trim() || undefined,
        guestPhone: normalizeTenDigitPhone(guestPhone) ?? undefined,
      });
      setNotice("Your custom package request has been sent to the Royal VIP concierge.");
      setPreferences("");
    } catch (err) {
      setError(toErrorMessage(err, "Failed to submit custom package request."));
    } finally {
      setBusy(false);
    }
  };

  if (loading || !user || !accessToken || !isGuestAccount(role) || !isApprovedVipMember(vipMembershipStatus)) {
    return <PageLoadingGate />;
  }

  return (
    <GuestDashboardShell
      title="Custom VIP package"
      subtitle={`Describe your ideal Mysuru itinerary. Travel must be booked at least ${VIP_MIN_ADVANCE_DAYS} days ahead.`}
      showRoleDescription={false}
    >
      <Link to="/member/vip" className="luxury-btn-sm dashboard-chrome-btn mb-5 inline-flex no-underline">
        ← VIP lounge
      </Link>
      <LuxuryCheckoutPanel>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="travel-start" className="eyebrow luxury-panel-label mb-2 block">
                Travel start
              </label>
              <input
                id="travel-start"
                type="date"
                required
                min={minDate}
                value={travelStart}
                onChange={(e) => setTravelStart(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="travel-end" className="eyebrow luxury-panel-label mb-2 block">
                Travel end
              </label>
              <input
                id="travel-end"
                type="date"
                required
                min={travelStart}
                value={travelEnd}
                onChange={(e) => setTravelEnd(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="guest-count" className="eyebrow luxury-panel-label mb-2 block">
                Guests
              </label>
              <input
                id="guest-count"
                type="number"
                min={1}
                max={50}
                required
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="guest-phone" className="eyebrow luxury-panel-label mb-2 block">
                Phone
              </label>
              <input
                id="guest-phone"
                {...TEN_DIGIT_PHONE_INPUT_PROPS}
                value={guestPhone}
                onChange={(e) => setGuestPhone(sanitizeTenDigitPhoneInput(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="preferences" className="eyebrow luxury-panel-label mb-2 block">
              Preferences & interests
            </label>
            <textarea
              id="preferences"
              rows={5}
              required
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="Palace experiences, wellness, culinary focus, celebration details…"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="luxury-btn-sm luxury-btn-primary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? "Sending…" : "Send request"}
          </button>
          {error ? (
            <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p className="rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.45)] px-4 py-3 text-sm luxury-panel-body">
              {notice}
            </p>
          ) : null}
        </form>
      </LuxuryCheckoutPanel>
    </GuestDashboardShell>
  );
}
