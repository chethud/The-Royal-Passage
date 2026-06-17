const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending review",
  published: "Published",
  rejected: "Rejected",
  archived: "Archived",
};

const STATUS_STYLES_DARK: Record<string, string> = {
  draft: "border-muted-foreground/30 text-muted-foreground",
  pending_review: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  published: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  rejected: "border-destructive/40 bg-destructive/10 text-destructive",
  archived: "border-muted-foreground/20 text-muted-foreground",
};

const STATUS_STYLES_LIGHT: Record<string, string> = {
  draft: "border-[rgb(88_16_0/0.2)] bg-[rgb(255_255_255/0.45)] text-[rgb(27_23_22/0.65)]",
  pending_review: "border-amber-700/30 bg-amber-50 text-amber-900",
  published: "border-emerald-700/30 bg-emerald-50 text-emerald-900",
  rejected: "border-destructive/40 bg-destructive/10 text-destructive",
  archived: "border-[rgb(88_16_0/0.2)] text-[rgb(27_23_22/0.55)]",
};

type ExperienceStatusBadgeProps = {
  status: string;
  surface?: "light" | "dark";
};

export function ExperienceStatusBadge({ status, surface = "dark" }: ExperienceStatusBadgeProps) {
  const styles = surface === "light" ? STATUS_STYLES_LIGHT : STATUS_STYLES_DARK;

  return (
    <span
      className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.12em] ${
        styles[status] ?? styles.draft
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
