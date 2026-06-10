import type { InputHTMLAttributes, ReactNode } from "react";

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" className="royal-gate-field__icon" aria-hidden>
      <path
        d="M2 5.5A2.5 2.5 0 0 1 4.5 3h11A2.5 2.5 0 0 1 18 5.5v9A2.5 2.5 0 0 1 15.5 17h-11A2.5 2.5 0 0 1 2 14.5v-9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M3 6l7 5 7-5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" className="royal-gate-field__icon" aria-hidden>
      <rect x="4.5" y="8.5" width="11" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M7 8.5V6.5a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" className="royal-gate-field__icon" aria-hidden>
      <circle cx="10" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" className="royal-gate-field__icon" aria-hidden>
      <path
        d="M6.5 3h2l1.2 3.5-1.6 1.1a8 8 0 0 0 3.4 3.4l1.1-1.6L16 11.5V13.5a2 2 0 0 1-2.2 2 14 14 0 0 1-9.3-9.3A2 2 0 0 1 6.5 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

const ICONS = {
  mail: MailIcon,
  lock: LockIcon,
  user: UserIcon,
  phone: PhoneIcon,
} as const;

type RoyalGateFieldProps = {
  id: string;
  label: string;
  icon?: keyof typeof ICONS;
  children: ReactNode;
  trailing?: ReactNode;
};

export function RoyalGateField({ id, label, icon = "mail", children, trailing }: RoyalGateFieldProps) {
  const Icon = ICONS[icon];
  return (
    <div className="royal-gate-field">
      <label htmlFor={id} className="royal-gate-field__label">
        {label}
      </label>
      <div className="royal-gate-field__input-wrap">
        <Icon />
        {children}
        {trailing}
      </div>
    </div>
  );
}

export function EyeToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="royal-gate-field__eye"
      onClick={onToggle}
      aria-label={visible ? "Hide password" : "Show password"}
    >
      {visible ? (
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
          <path d="M2 2l16 16" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1.5 10S4.5 4.5 10 4.5c1.3 0 2.5.3 3.5.8M18.5 10S15.5 15.5 10 15.5c-1.3 0-2.5-.3-3.5-.8" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
          <path d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      )}
    </button>
  );
}

export function royalGateInputClass(disabled?: boolean) {
  return `royal-gate-field__input${disabled ? " is-muted" : ""}`;
}

export type { InputHTMLAttributes };
