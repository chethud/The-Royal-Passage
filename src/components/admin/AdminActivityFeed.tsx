import type { AuditLogEntry } from "@/lib/api/admin";
import { formatDateLong } from "@/lib/date-format";

type AdminActivityFeedProps = {
  entries: AuditLogEntry[];
};

export function AdminActivityFeed({ entries }: AdminActivityFeedProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent activity.</p>;
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="rounded-sm border border-[oklch(0.88_0.08_86_/_0.15)] px-4 py-3 text-sm"
        >
          <div className="font-medium">{entry.action.replaceAll("_", " ")}</div>
          <div className="text-xs text-muted-foreground">
            {entry.actorName ?? "System"} · {entry.entityType}
            {entry.entityId ? ` · ${entry.entityId.slice(0, 8)}` : ""} ·{" "}
            {formatDateLong(entry.createdAt.slice(0, 10))}
          </div>
        </li>
      ))}
    </ul>
  );
}
