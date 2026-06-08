import { Crown, Shield, UserRound } from "lucide-react";
import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  type UserRole,
} from "@/lib/roles";
import { cn } from "@/lib/utils";

const ROLE_ICONS: Record<UserRole, typeof UserRound> = {
  guest: UserRound,
  host: Crown,
  admin: Shield,
};

type RoleSelectorProps = {
  value: UserRole;
  onChange: (role: UserRole) => void;
  className?: string;
};

export function RoleSelector({ value, onChange, className }: RoleSelectorProps) {
  const roles: UserRole[] = ["guest", "host", "admin"];

  return (
    <div className={cn("space-y-3", className)}>
      <p className="eyebrow text-foreground/90">Continue as</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {roles.map((role) => {
          const Icon = ROLE_ICONS[role];
          const selected = value === role;

          return (
            <button
              key={role}
              type="button"
              onClick={() => onChange(role)}
              aria-pressed={selected}
              className={cn(
                "rounded-sm border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/50",
                selected
                  ? "border-ember/70 bg-ember/10 text-foreground"
                  : "border-[oklch(0.88_0.08_86_/_0.35)] bg-background/20 text-foreground/85 hover:border-ember/40",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4 text-ember" />
                {ROLE_LABELS[role]}
              </span>
              <span className="mt-1 block text-[0.72rem] leading-snug text-muted-foreground">
                {ROLE_DESCRIPTIONS[role]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
