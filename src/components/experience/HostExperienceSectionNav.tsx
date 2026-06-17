import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  HOST_EXPERIENCE_SECTION_LABELS,
  HOST_EXPERIENCE_SECTIONS,
  type HostExperienceSection,
} from "@/lib/host-experience-section";

type HostExperienceSectionNavProps = {
  experienceId: string;
  active: HostExperienceSection;
  slotCount?: number;
  className?: string;
};

export function HostExperienceSectionNav({
  experienceId,
  active,
  slotCount,
  className,
}: HostExperienceSectionNavProps) {
  return (
    <nav
      aria-label="Experience management"
      className={cn(
        "flex flex-wrap gap-2 rounded-md border border-gold/25 bg-brand-noir p-1.5",
        className,
      )}
    >
      {HOST_EXPERIENCE_SECTIONS.map((section) => {
        const isActive = section === active;
        return (
          <Link
            key={section}
            to="/host/experiences/$experienceId"
            params={{ experienceId }}
            search={{ section }}
            className={cn(
              "rounded-sm border px-4 py-2.5 text-sm font-medium tracking-[0.06em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
              isActive
                ? "border-gold/50 bg-gold/12 text-gold shadow-[inset_0_1px_0_color-mix(in_srgb,var(--brand-gold-light)_15%,transparent)]"
                : "border-transparent text-muted-foreground hover:border-gold/20 hover:bg-brand-maroon-deep/30 hover:text-ink",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {HOST_EXPERIENCE_SECTION_LABELS[section]}
            {section === "sessions" && slotCount != null ? (
              <span
                className={cn(
                  "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold",
                  isActive
                    ? "bg-gold/20 text-gold"
                    : "border border-gold/25 bg-brand-maroon-deep/40 text-muted-foreground",
                )}
              >
                {slotCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
