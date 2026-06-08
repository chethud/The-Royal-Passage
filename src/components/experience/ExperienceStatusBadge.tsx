const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  published: "Published",
  rejected: "Rejected",
  archived: "Archived",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "border-muted-foreground/30 text-muted-foreground",
  pending_review: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  published: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  rejected: "border-destructive/40 bg-destructive/10 text-destructive",
  archived: "border-muted-foreground/20 text-muted-foreground",
};

type ExperienceStatusBadgeProps = {
  status: string;
};

export function ExperienceStatusBadge({ status }: ExperienceStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.12em] ${
        STATUS_STYLES[status] ?? STATUS_STYLES.draft
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
