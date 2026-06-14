import { Link } from "@tanstack/react-router";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import type { AdminExperienceSummary } from "@/lib/api/admin";
import { formatDateLong } from "@/lib/date-format";

type AdminExperienceApprovalRowProps = {
  row: AdminExperienceSummary;
  reviewLabel?: string;
};

export function AdminExperienceApprovalRow({
  row,
  reviewLabel = "Review full details",
}: AdminExperienceApprovalRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Link
        to="/admin/experiences/$experienceId"
        params={{ experienceId: row.id }}
        className="luxury-panel-link min-w-0 flex-1 hover:underline"
      >
        <div className="luxury-panel-heading font-display text-lg">{row.title}</div>
        <div className="luxury-panel-body mt-1 text-sm">
          {row.hostName} · {row.city} · {formatDateLong(row.createdAt.slice(0, 10))}
        </div>
        {row.slug ? (
          <div className="luxury-panel-body mt-1 text-xs opacity-80">Slug: {row.slug}</div>
        ) : null}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <ExperienceStatusBadge status={row.status} />
        <Link
          to="/admin/experiences/$experienceId"
          params={{ experienceId: row.id }}
          className="luxury-btn-sm luxury-btn-primary inline-flex items-center no-underline"
        >
          {reviewLabel}
        </Link>
      </div>
    </div>
  );
}
