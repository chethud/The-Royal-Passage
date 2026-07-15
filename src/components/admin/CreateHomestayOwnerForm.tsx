import { useState, type FormEvent } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { createHomestayOwner } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";

const inputClass =
  "w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/50 focus:outline-none focus:ring-1 focus:ring-[#4A0000]/25";

type CreateHomestayOwnerFormProps = {
  accessToken: string;
  onCreated: () => void;
};

export function CreateHomestayOwnerForm({ accessToken, onCreated }: CreateHomestayOwnerFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      await createHomestayOwner(accessToken, {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
      });
      setNotice(`Homestay owner login created for ${email.trim()}. Share these credentials securely.`);
      setFullName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setAddress("");
      onCreated();
    } catch (err) {
      setError(toErrorMessage(err, "Failed to create homestay owner account."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <LuxuryCheckoutPanel>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="luxury-panel-heading font-display text-2xl">Add homestay owner</h2>
          <p className="luxury-panel-body mt-2 text-sm">
            Create a login for property owners. They manage listings and stay bookings from
            their dashboard (owner portal coming in Phase 3).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="owner-full-name" className="eyebrow luxury-panel-label mb-2 block">
              Full name
            </label>
            <input
              id="owner-full-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Royal Heritage Stays"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="owner-email" className="eyebrow luxury-panel-label mb-2 block">
              Login email
            </label>
            <input
              id="owner-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="owner-password" className="eyebrow luxury-panel-label mb-2 block">
              Temporary password
            </label>
            <input
              id="owner-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="owner-phone" className="eyebrow luxury-panel-label mb-2 block">
              Phone
            </label>
            <input
              id="owner-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98XXXXXXX"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="owner-address" className="eyebrow luxury-panel-label mb-2 block">
            Address
          </label>
          <textarea
            id="owner-address"
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Business address or primary property location"
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="luxury-btn-sm luxury-btn-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? "Creating owner login..." : "Create owner login"}
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
  );
}
