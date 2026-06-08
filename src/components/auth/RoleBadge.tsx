import { ROLE_LABELS, type UserRole } from "@/lib/roles";
import { cn } from "@/lib/utils";

type RoleBadgeProps = {
  role: UserRole;
  className?: string;
};

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-ember/35 bg-ember/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-ember",
        className,
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
