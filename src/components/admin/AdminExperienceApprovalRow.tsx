import { Link } from "@tanstack/react-router";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import type { AdminExperienceSummary } from "@/lib/api/admin";
import { formatDateLong } from "@/lib/date-format";

const reviewBtn =
  "inline-flex items-center rounded-sm border border-ember/55 bg-ember/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-ember transition-colors hover:bg-ember/20";

type AdminExperienceApprovalRowProps = {
  row: AdminExperienceSummary;
  reviewLabel?: string;
};

export function AdminExperienceApprovalRow({
  row,
  reviewLabel = "Review full details",
}: AdminExperienceApprovalRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-[oklch(0.88_0.08_86_/_0.15)] p-4 transition-colors hover:border-ember/30">
      <Link
        to="/admin/experiences/$experienceId"
        params={{ experienceId: row.id }}
        className="min-w-0 flex-1 hover:text-ember"
      >
        <div className="font-display text-lg">{row.title}</div>
        <div className="mt-1 text-sm text-muted-foreground">
          {row.hostName} · {row.city} · {formatDateLong(row.createdAt.slice(0, 10))}
        </div>
        {row.slug ? (
          <div className="mt-1 text-xs text-muted-foreground/80">Slug: {row.slug}</div>
        ) : null}
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <ExperienceStatusBadge status={row.status} />
        <Link
          to="/admin/experiences/$experienceId"
          params={{ experienceId: row.id }}
          className={reviewBtn}
        >
          {reviewLabel}
        </Link>
      </div>
    </div>
  );
}
