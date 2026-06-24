import { useState, type FormEvent } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { createPlatformUser } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, type UserRole } from "@/lib/roles";

const inputClass =
  "w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/50 focus:outline-none focus:ring-1 focus:ring-[#4A0000]/25";

const CREATABLE_ROLES = [
  "host",
  "homestay_owner",
  "vip_owner",
  "admin",
  "editor",
] as const satisfies readonly UserRole[];

type CreatableRole = (typeof CREATABLE_ROLES)[number];

type CreatePlatformUserFormProps = {
  accessToken: string;
  onCreated: () => void;
};

export function CreatePlatformUserForm({ accessToken, onCreated }: CreatePlatformUserFormProps) {
  const [role, setRole] = useState<CreatableRole>("host");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const showBio = role === "host";
  const showAddress = role === "homestay_owner" || role === "vip_owner";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      if (!isApiConfigured()) {
        throw new Error("VITE_API_BASE_URL is not configured for this deployment.");
      }
      await createPlatformUser(accessToken, {
        role,
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        bio: showBio ? bio.trim() || undefined : undefined,
        address: showAddress ? address.trim() || undefined : undefined,
      });
      setNotice(
        `${ROLE_LABELS[role]} login created for ${email.trim()}. Share these credentials securely.`,
      );
      setFullName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setBio("");
      setAddress("");
      onCreated();
    } catch (err) {
      setError(toErrorMessage(err, "Failed to create user account."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <LuxuryCheckoutPanel>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="luxury-panel-heading font-display text-2xl">Create platform user</h2>
          <p className="luxury-panel-body mt-2 text-sm">
            Create a login with role-based access. Guests sign up themselves; all other roles are
            provisioned here by admins.
          </p>
        </div>

        <div>
          <label htmlFor="platform-user-role" className="eyebrow luxury-panel-label mb-2 block">
            Role
          </label>
          <select
            id="platform-user-role"
            value={role}
            onChange={(e) => setRole(e.target.value as CreatableRole)}
            className={inputClass}
          >
            {CREATABLE_ROLES.map((value) => (
              <option key={value} value={value}>
                {ROLE_LABELS[value]}
              </option>
            ))}
          </select>
          <p className="luxury-panel-body mt-2 text-xs">{ROLE_DESCRIPTIONS[role]}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="platform-user-name" className="eyebrow luxury-panel-label mb-2 block">
              Full name
            </label>
            <input
              id="platform-user-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Display name"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="platform-user-email" className="eyebrow luxury-panel-label mb-2 block">
              Login email
            </label>
            <input
              id="platform-user-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="platform-user-password" className="eyebrow luxury-panel-label mb-2 block">
              Temporary password
            </label>
            <input
              id="platform-user-password"
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
            <label htmlFor="platform-user-phone" className="eyebrow luxury-panel-label mb-2 block">
              Phone
            </label>
            <input
              id="platform-user-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98XXXXXXX"
              className={inputClass}
            />
          </div>
        </div>

        {showBio ? (
          <div>
            <label htmlFor="platform-user-bio" className="eyebrow luxury-panel-label mb-2 block">
              Short bio
            </label>
            <textarea
              id="platform-user-bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Host background shown on listings"
              className={inputClass}
            />
          </div>
        ) : null}

        {showAddress ? (
          <div>
            <label htmlFor="platform-user-address" className="eyebrow luxury-panel-label mb-2 block">
              Address
            </label>
            <textarea
              id="platform-user-address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Business or property address"
              className={inputClass}
            />
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="luxury-btn-sm luxury-btn-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? "Creating login…" : `Create ${ROLE_LABELS[role].toLowerCase()} login`}
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
