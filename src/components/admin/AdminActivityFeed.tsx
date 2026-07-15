import { Link } from "@tanstack/react-router";
import type { AuditLogEntry } from "@/lib/api/admin";
import { formatDateLong } from "@/lib/date-format";

type AdminActivityFeedProps = {
  entries: AuditLogEntry[];
};

const ACTION_COPY: Record<string, { label: string; href?: string }> = {
  booking_created: { label: "New booking", href: "/admin/bookings" },
  booking_cancelled: { label: "Cancellation", href: "/admin/bookings" },
  homestay_booking_created: { label: "New stay booking", href: "/admin/homestay" },
  review_created: { label: "New review", href: "/admin/reviews" },
  review_hidden: { label: "Review moderated", href: "/admin/reviews" },
  experience_published: { label: "Approval — experience published", href: "/admin/experiences" },
  experience_rejected: { label: "Rejection — experience", href: "/admin/experiences" },
  homestay_published: { label: "Approval — homestay published", href: "/admin/homestays" },
  vip_package_published: { label: "Approval — VIP package", href: "/admin/vip-packages" },
  host_signup: { label: "Host signup", href: "/admin/profile/users" },
};

function resolveAction(entry: AuditLogEntry) {
  return (
    ACTION_COPY[entry.action] ?? {
      label: entry.action.replaceAll("_", " "),
    }
  );
}

export function AdminActivityFeed({ entries }: AdminActivityFeedProps) {
  if (entries.length === 0) {
    return <p className="luxury-panel-body py-8 text-sm">No recent activity.</p>;
  }

  return (
    <ul className="divide-y divide-[rgb(74_0_0/0.12)]">
      {entries.map((entry) => {
        const action = resolveAction(entry);
        const stamp = entry.createdAt.includes("T")
          ? new Date(entry.createdAt).toLocaleString()
          : formatDateLong(entry.createdAt.slice(0, 10));

        return (
          <li key={entry.id} className="py-4 first:pt-0 last:pb-0 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="luxury-panel-heading font-medium capitalize">{action.label}</div>
                <div className="luxury-panel-body mt-1 text-xs">
                  {entry.actorName ?? "System"} · {entry.entityType}
                  {entry.entityId ? ` · ${entry.entityId.slice(0, 8)}` : ""} · {stamp}
                </div>
              </div>
              {action.href ? (
                <Link
                  to={action.href}
                  className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[#9A7228] hover:underline"
                >
                  Open
                </Link>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
