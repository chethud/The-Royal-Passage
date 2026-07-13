import type { Experience } from "@/data/experiences";
import { getExperienceSmartBadges, type SmartBadge } from "@/lib/experience-smart-badges";

export function ExperienceSmartBadges({
  exp,
  limit = 2,
}: {
  exp: Experience;
  limit?: number;
}) {
  const badges = getExperienceSmartBadges(exp, limit);
  if (badges.length === 0) return null;

  return (
    <ul className="flex max-w-[11rem] flex-col items-start gap-1" aria-label="Availability highlights">
      {badges.map((badge) => (
        <li key={badge.id}>
          <SmartBadgeChip badge={badge} />
        </li>
      ))}
    </ul>
  );
}

function SmartBadgeChip({ badge }: { badge: SmartBadge }) {
  return (
    <span className="inline-flex rounded-sm border border-[rgb(200_162_90/0.4)] bg-black/45 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-[#F7F1E8] shadow-[0_1px_6px_rgba(0,0,0,0.45)] backdrop-blur-sm">
      {badge.label}
    </span>
  );
}
