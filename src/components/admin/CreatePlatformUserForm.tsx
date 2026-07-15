import { useMemo, useState, type FormEvent } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import { createPlatformUser } from "@/lib/api/admin";
import { isApiConfigured, toErrorMessage } from "@/lib/api/client";
import type { UserRole } from "@/lib/roles";

const inputClass =
  "w-full rounded-sm border border-[rgb(74_0_0/0.2)] bg-[rgb(255_255_255/0.55)] px-4 py-3 text-sm luxury-panel-body placeholder:text-[rgb(58_0_0/0.4)] focus:border-[#4A0000]/50 focus:outline-none focus:ring-1 focus:ring-[#4A0000]/25";

export type CreatePlatformUserAudience = "providers" | "team";

const PROVIDER_ROLES = ["host", "homestay_owner", "vip_owner"] as const satisfies readonly UserRole[];
const TEAM_ROLES = [
  "admin",
  "editor",
  "host",
  "homestay_owner",
  "vip_owner",
] as const satisfies readonly UserRole[];

type ProviderRole = (typeof PROVIDER_ROLES)[number];
type TeamRole = (typeof TEAM_ROLES)[number];
type CreatableRole = ProviderRole | TeamRole;

const PROVIDER_ROLE_META: Record<ProviderRole, { label: string; description: string }> = {
  host: {
    label: "Experiences",
    description: "Provider login for experience listings, bookings, and host tools.",
  },
  homestay_owner: {
    label: "Homestay",
    description: "Provider login for properties, stay bookings, and homestay tools.",
  },
  vip_owner: {
    label: "VIP",
    description: "Provider login for VIP packages, members, and owner tools.",
  },
};

const TEAM_ROLE_META: Record<TeamRole, { label: string; description: string }> = {
  admin: {
    label: "Admin",
    description: "Full platform dashboard — bookings, approvals, users, and site content.",
  },
  editor: {
    label: "Editor",
    description: "Content dashboard — homepage photos, headings, journal, and heritage video.",
  },
  host: {
    label: "Experiences",
    description: "Experiences host dashboard — manage listings, sessions, and bookings.",
  },
  homestay_owner: {
    label: "Homestay",
    description: "Homestay owner dashboard — manage properties and stay bookings.",
  },
  vip_owner: {
    label: "VIP",
    description: "VIP owner dashboard — manage packages, members, and requests.",
  },
};

const AUDIENCE_CONFIG = {
  providers: {
    roles: PROVIDER_ROLES,
    roleMeta: PROVIDER_ROLE_META as Record<CreatableRole, { label: string; description: string }>,
    defaultRoles: ["host"] as CreatableRole[],
    title: "Create provider login",
    subtitle:
      "Provision Experiences, Homestay, or VIP access for providers. Guests sign up themselves; provider logins are created here by admins.",
    rolesLegend: "Access areas",
    rolesHint:
      "Selected: {summary}. Providers can hold more than one area, such as Experiences and Homestay.",
    submitIdle: "Create provider login",
    notice: (email: string, summary: string) =>
      `Provider login created for ${email} with access: ${summary}. Share these credentials securely.`,
  },
  team: {
    roles: TEAM_ROLES,
    roleMeta: TEAM_ROLE_META as Record<CreatableRole, { label: string; description: string }>,
    defaultRoles: ["admin"] as CreatableRole[],
    title: "Add team member",
    subtitle:
      "Create logins for your team so they can open dashboards: Admin, Editor, Experiences, Homestay, or VIP.",
    rolesLegend: "Dashboard access",
    rolesHint:
      "Selected: {summary}. Team members can hold more than one dashboard role when needed.",
    submitIdle: "Create team login",
    notice: (email: string, summary: string) =>
      `Team login created for ${email} with access: ${summary}. Share these credentials securely.`,
  },
} as const;

type CreatePlatformUserFormProps = {
  accessToken: string;
  onCreated: () => void;
  audience?: CreatePlatformUserAudience;
};

export function CreatePlatformUserForm({
  accessToken,
  onCreated,
  audience = "providers",
}: CreatePlatformUserFormProps) {
  const config = AUDIENCE_CONFIG[audience];
  const roleMeta = config.roleMeta;
  const creatableRoles = config.roles as readonly CreatableRole[];

  const [roles, setRoles] = useState<CreatableRole[]>([...config.defaultRoles]);
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
    () => roles.map((role) => roleMeta[role].label).join(", "),
    [roleMeta, roles],
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
      setNotice(config.notice(email.trim(), roleSummary));
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

  const fieldPrefix = audience === "team" ? "team-user" : "platform-user";

  return (
    <LuxuryCheckoutPanel>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h2 className="luxury-panel-heading font-display text-2xl">{config.title}</h2>
          <p className="luxury-panel-body mt-2 text-sm">{config.subtitle}</p>
        </div>

        <fieldset>
          <legend className="eyebrow luxury-panel-label mb-3 block">{config.rolesLegend}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {creatableRoles.map((value) => {
              const checked = roles.includes(value);
              const meta = roleMeta[value];
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
                    <span className="block text-sm font-medium text-[#4A0000]">{meta.label}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-[rgb(74_0_0/0.72)]">
                      {meta.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
          <p className="luxury-panel-body mt-2 text-xs">
            {config.rolesHint.replace("{summary}", roleSummary)}
          </p>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${fieldPrefix}-name`} className="eyebrow luxury-panel-label mb-2 block">
              Full name
            </label>
            <input
              id={`${fieldPrefix}-name`}
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Display name"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${fieldPrefix}-email`} className="eyebrow luxury-panel-label mb-2 block">
              Login email
            </label>
            <input
              id={`${fieldPrefix}-email`}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor={`${fieldPrefix}-password`}
              className="eyebrow luxury-panel-label mb-2 block"
            >
              Temporary password
            </label>
            <input
              id={`${fieldPrefix}-password`}
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
            <label htmlFor={`${fieldPrefix}-phone`} className="eyebrow luxury-panel-label mb-2 block">
              Phone
            </label>
            <input
              id={`${fieldPrefix}-phone`}
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
            <label htmlFor={`${fieldPrefix}-bio`} className="eyebrow luxury-panel-label mb-2 block">
              Short bio
            </label>
            <textarea
              id={`${fieldPrefix}-bio`}
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
            <label
              htmlFor={`${fieldPrefix}-address`}
              className="eyebrow luxury-panel-label mb-2 block"
            >
              Address
            </label>
            <textarea
              id={`${fieldPrefix}-address`}
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
          {busy ? "Creating login…" : config.submitIdle}
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
