import type { AuditLogEntry } from "@/lib/api/admin";
import { formatDateLong } from "@/lib/date-format";

type AdminActivityFeedProps = {
  entries: AuditLogEntry[];
};

export function AdminActivityFeed({ entries }: AdminActivityFeedProps) {
  if (entries.length === 0) {
    return <p className="luxury-panel-body py-8 text-sm">No recent activity.</p>;
  }

  return (
    <ul className="divide-y divide-[rgb(88_16_0/0.12)]">
      {entries.map((entry) => (
        <li key={entry.id} className="py-4 first:pt-0 last:pb-0 text-sm">
          <div className="luxury-panel-heading font-medium capitalize">
            {entry.action.replaceAll("_", " ")}
          </div>
          <div className="luxury-panel-body mt-1 text-xs">
            {entry.actorName ?? "System"} · {entry.entityType}
            {entry.entityId ? ` · ${entry.entityId.slice(0, 8)}` : ""} ·{" "}
            {formatDateLong(entry.createdAt.slice(0, 10))}
          </div>
        </li>
      ))}
    </ul>
  );
}
