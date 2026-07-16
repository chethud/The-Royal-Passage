import { useState, type FormEvent } from "react";
import { ROLE_LABELS, type UserRole } from "@/lib/roles";

const inputClass =
  "w-full rounded-sm border border-input bg-background/50 px-4 py-3 text-sm normal-case tracking-normal text-foreground placeholder:text-muted-foreground [font-family:Georgia,'Times_New_Roman',serif] focus:border-ember/50 focus:outline-none focus:ring-1 focus:ring-ember/30";
const labelClass =
  "mb-2 block text-sm font-medium normal-case tracking-normal text-foreground/90 [font-family:Georgia,'Times_New_Roman',serif]";

type StaffLoginFormProps = {
  role: Extract<UserRole, "host" | "admin">;
  busy: boolean;
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>;
};

export function StaffLoginForm({ role, busy, onSubmit }: StaffLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit({ email: email.trim(), password });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {role === "host"
          ? "Hosts cannot sign up publicly. Use the email and password created for you in the admin panel."
          : "Admin accounts are created by the platform team. Sign in with your assigned credentials."}
      </p>
      <div>
        <label htmlFor={`${role}-email`} className={labelClass}>
          Email
        </label>
        <input
          id={`${role}-email`}
          name="email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          placeholder={`${ROLE_LABELS[role].toLowerCase()}@example.com`}
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase())}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor={`${role}-password`} className={labelClass}>
          Password
        </label>
        <input
          id={`${role}-password`}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>
      <button
        type="submit"
        disabled={busy || !email.trim() || !password}
        className="w-full rounded-sm bg-ember py-3.5 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {busy ? "Signing in..." : `Sign in as ${ROLE_LABELS[role]}`}
      </button>
    </form>
  );
}
