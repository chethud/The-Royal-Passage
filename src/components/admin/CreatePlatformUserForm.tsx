import { useMemo, useState, type FormEvent } from "react";
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
  const [roles, setRoles] = useState<CreatableRole[]>(["host"]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const showBio = roles.includes("host");
  const showAddress = roles.includes("homestay_owner") || roles.includes("vip_owner");

  const roleSummary = useMemo(
    () => roles.map((role) => ROLE_LABELS[role]).join(", "),
    [roles],
  );

  const toggleRole = (role: CreatableRole) => {
    setRoles((current) => {
      if (current.includes(role)) {
        const next = current.filter((value) => value !== role);
        return next.length > 0 ? next : current;
      }
      return [...current, role];
    });
    setError(null);
    setNotice(null);
  };

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
        roles,
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        bio: showBio ? bio.trim() || undefined : undefined,
        address: showAddress ? address.trim() || undefined : undefined,
      });
      setNotice(
        `Login created for ${email.trim()} with access: ${roleSummary}. Share these credentials securely.`,
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
            Create a login and assign one or more access roles. Guests sign up themselves; all
            other access is provisioned here by admins.
          </p>
        </div>

        <fieldset>
          <legend className="eyebrow luxury-panel-label mb-3 block">Access roles</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {CREATABLE_ROLES.map((value) => {
              const checked = roles.includes(value);
              return (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-3 rounded-sm border px-4 py-3 transition-colors ${
                    checked
                      ? "border-[#C8A25A] bg-[rgb(200_162_90/0.14)]"
                      : "border-[rgb(74_0_0/0.18)] bg-[rgb(255_255_255/0.45)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRole(value)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium text-[#4A0000]">
                      {ROLE_LABELS[value]}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-[rgb(74_0_0/0.72)]">
                      {ROLE_DESCRIPTIONS[value]}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="luxury-panel-body mt-2 text-xs">
            Selected: {roleSummary}. Users can hold multiple roles, such as host and editor.
          </p>
        </fieldset>

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
          disabled={busy || roles.length === 0}
          className="luxury-btn-sm luxury-btn-primary disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy ? "Creating login…" : "Create user login"}
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
