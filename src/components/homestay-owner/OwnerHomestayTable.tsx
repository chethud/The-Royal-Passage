import { Link } from "@tanstack/react-router";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import type { OwnerHomestaySummary } from "@/lib/api/owner-homestays";
import { formatMoney } from "@/lib/money";

type OwnerHomestayTableProps = {
  homestays: OwnerHomestaySummary[];
};

export function OwnerHomestayTable({ homestays }: OwnerHomestayTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className="border-b text-xs uppercase tracking-[0.14em] luxury-panel-divider luxury-panel-label">
            <th className="px-3 py-2 font-medium">Property</th>
            <th className="px-3 py-2 font-medium">City</th>
            <th className="px-3 py-2 font-medium">From / night</th>
            <th className="px-3 py-2 font-medium">Rooms</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {homestays.map((stay) => (
            <tr key={stay.id} className="border-b luxury-panel-divider">
              <td className="px-3 py-3">
                <div className="luxury-panel-heading font-display text-lg">{stay.title}</div>
                <div className="luxury-panel-body text-xs">{stay.slug}</div>
              </td>
              <td className="luxury-panel-body px-3 py-3">{stay.city}</td>
              <td className="luxury-panel-body px-3 py-3">
                {formatMoney(stay.pricePerNightMinor, stay.currencySymbol)}
              </td>
              <td className="luxury-panel-body px-3 py-3">{stay.roomCount}</td>
              <td className="px-3 py-3">
                <ExperienceStatusBadge status={stay.status} surface="light" />
              </td>
              <td className="px-3 py-3">
                <Link
                  to="/homestay/properties/$homestayId"
                  params={{ homestayId: stay.id }}
                  className="luxury-btn-sm luxury-btn-primary inline-flex items-center no-underline"
                >
                  Manage
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
