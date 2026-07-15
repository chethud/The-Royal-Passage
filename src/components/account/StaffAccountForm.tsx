import { useState, type FormEvent } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import type { GuestProfile } from "@/lib/api/guest";
import { updateAccountProfile } from "@/lib/profile-browser";
import { isSupabaseBrowserConfigured } from "@/lib/supabase/browser";
import { toErrorMessage } from "@/lib/api/client";
import { ROLE_LABELS, isUserRole } from "@/lib/roles";

const inputClass =
  "w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/50 focus:outline-none focus:ring-1 focus:ring-[#4A0000]/25";

type StaffAccountFormProps = {
  profile: GuestProfile;
  onUpdated: (profile: GuestProfile) => void;
};

export function StaffAccountForm({ profile, onUpdated }: StaffAccountFormProps) {
  const [fullName, setFullName] = useState(profile.fullName ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const roleLabel = isUserRole(profile.role) ? ROLE_LABELS[profile.role] : profile.role;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      if (!isSupabaseBrowserConfigured()) {
        throw new Error("Supabase is not configured for this deployment.");
      }
      const updated = await updateAccountProfile({
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      onUpdated(updated);
      setSaved(true);
    } catch (err) {
      setError(toErrorMessage(err, "Failed to update account."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <LuxuryCheckoutPanel>
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <div>
          <h2 className="luxury-panel-heading font-display text-2xl">Account details</h2>
          <p className="luxury-panel-body mt-2 text-sm">
            Update your contact details. The identity passport is for guest travellers only.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="staff-full-name" className="eyebrow luxury-panel-label mb-2 block">
              Full name
            </label>
            <input
              id="staff-full-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Display name"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="staff-email" className="eyebrow luxury-panel-label mb-2 block">
              Email
            </label>
            <input
              id="staff-email"
              type="email"
              value={profile.email ?? ""}
              disabled
              className={`${inputClass} opacity-70`}
            />
          </div>
          <div>
            <label htmlFor="staff-phone" className="eyebrow luxury-panel-label mb-2 block">
              Phone
            </label>
            <input
              id="staff-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98XXXXXXX"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="staff-role" className="eyebrow luxury-panel-label mb-2 block">
              Access
            </label>
            <input
              id="staff-role"
              value={roleLabel}
              disabled
              className={`${inputClass} opacity-70`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="luxury-btn-sm luxury-btn-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? "Saving…" : "Save account"}
        </button>

        {error ? (
          <p className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.45)] px-4 py-3 text-sm luxury-panel-body">
            Account updated.
          </p>
        ) : null}
      </form>
    </LuxuryCheckoutPanel>
  );
}
