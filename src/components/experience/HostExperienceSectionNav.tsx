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
        "flex flex-wrap gap-2 rounded-md border border-[oklch(0.88_0.08_86_/_0.2)] bg-[oklch(0.98_0.02_86_/_0.5)] p-1.5",
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
              "rounded-sm px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60",
              isActive
                ? "bg-ember text-primary-foreground shadow-sm"
                : "text-[#4A0000]/80 hover:bg-white/60 hover:text-[#3A0000]",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {HOST_EXPERIENCE_SECTION_LABELS[section]}
            {section === "sessions" && slotCount != null ? (
              <span
                className={cn(
                  "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold",
                  isActive ? "bg-white/20 text-primary-foreground" : "bg-[#4A0000]/8 text-[#4A0000]",
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
