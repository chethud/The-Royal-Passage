import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { GuestDashboardShell } from "@/components/guest/GuestDashboardShell";
import { submitVipMembershipApplication } from "@/lib/api/vip-membership";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { useAuthUser } from "@/lib/auth-user";
import { PageLoadingGate } from "@/components/ui/PageLoadingGate";

const inputClass =
  "w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/50 focus:outline-none focus:ring-1 focus:ring-[#4A0000]/25";

export function VipMembershipApplyForm() {
  const navigate = useNavigate();
  const { user, accessToken, displayName, profile, refreshVipMembershipStatus } = useAuthUser();
  const [fullName, setFullName] = useState(displayName ?? profile?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [address, setAddress] = useState("");
  const [idDocumentType, setIdDocumentType] = useState<"aadhaar" | "visitor_id" | "business_id">(
    "aadhaar",
  );
  const [idDocumentNumber, setIdDocumentNumber] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!accessToken) return;
    setBusy(true);
    setError(null);
    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      await submitVipMembershipApplication(accessToken, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        idDocumentType,
        idDocumentNumber: idDocumentNumber.trim(),
      });
      await refreshVipMembershipStatus();
      void navigate({ to: "/account/profile" });
    } catch (err) {
      setError(toErrorMessage(err, "Failed to submit VIP membership application."));
    } finally {
      setBusy(false);
    }
  };

  if (!user || !accessToken) {
    return <PageLoadingGate />;
  }

  return (
    <LuxuryCheckoutPanel>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <h2 className="luxury-panel-heading font-display text-2xl">VIP membership application</h2>
          <p className="luxury-panel-body mt-2 text-sm">
            Share your details and government-issued ID. Our Royal VIP concierge will review your
            application and notify you once approved.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="vip-full-name" className="eyebrow luxury-panel-label mb-2 block">
              Full name
            </label>
            <input
              id="vip-full-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="vip-email" className="eyebrow luxury-panel-label mb-2 block">
              Email
            </label>
            <input
              id="vip-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="vip-phone" className="eyebrow luxury-panel-label mb-2 block">
              Phone
            </label>
            <input
              id="vip-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="vip-id-type" className="eyebrow luxury-panel-label mb-2 block">
              ID document type
            </label>
            <select
              id="vip-id-type"
              required
              value={idDocumentType}
              onChange={(e) =>
                setIdDocumentType(e.target.value as "aadhaar" | "visitor_id" | "business_id")
              }
              className={inputClass}
            >
              <option value="aadhaar">Aadhaar card</option>
              <option value="visitor_id">Visitor / passport ID</option>
              <option value="business_id">Business registration ID</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="vip-id-number" className="eyebrow luxury-panel-label mb-2 block">
            ID document number
          </label>
          <input
            id="vip-id-number"
            required
            value={idDocumentNumber}
            onChange={(e) => setIdDocumentNumber(e.target.value)}
            placeholder="Enter your ID number"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="vip-address" className="eyebrow luxury-panel-label mb-2 block">
            Address
          </label>
          <textarea
            id="vip-address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Residential or business address"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="luxury-btn-sm luxury-btn-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? "Submitting…" : "Submit application"}
        </button>

        {error ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </form>
    </LuxuryCheckoutPanel>
  );
}
