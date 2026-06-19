import { Link } from "@tanstack/react-router";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import {
  DashboardTable,
  DashboardTableBody,
  DashboardTableCell,
  DashboardTableHead,
  DashboardTableHeadCell,
  DashboardTableHeadRow,
  DashboardTableRow,
  DashboardTableScroll,
} from "@/components/ui/DashboardTable";
import type { OwnerHomestaySummary } from "@/lib/api/owner-homestays";
import { formatMoney } from "@/lib/money";

type OwnerHomestayTableProps = {
  homestays: OwnerHomestaySummary[];
};

export function OwnerHomestayTable({ homestays }: OwnerHomestayTableProps) {
  return (
    <DashboardTableScroll>
      <DashboardTable minWidth="lg">
        <DashboardTableHead>
          <DashboardTableHeadRow>
            <DashboardTableHeadCell>Property</DashboardTableHeadCell>
            <DashboardTableHeadCell>City</DashboardTableHeadCell>
            <DashboardTableHeadCell>From / night</DashboardTableHeadCell>
            <DashboardTableHeadCell>Rooms</DashboardTableHeadCell>
            <DashboardTableHeadCell>Status</DashboardTableHeadCell>
            <DashboardTableHeadCell>Actions</DashboardTableHeadCell>
          </DashboardTableHeadRow>
        </DashboardTableHead>
        <DashboardTableBody>
          {homestays.map((stay) => (
            <DashboardTableRow key={stay.id}>
              <DashboardTableCell variant="heading">
                <div className="font-display text-lg">{stay.title}</div>
                <div className="luxury-panel-body text-xs">{stay.slug}</div>
              </DashboardTableCell>
              <DashboardTableCell>{stay.city}</DashboardTableCell>
              <DashboardTableCell>
                {formatMoney(stay.pricePerNightMinor, stay.currencySymbol)}
              </DashboardTableCell>
              <DashboardTableCell>{stay.roomCount}</DashboardTableCell>
              <DashboardTableCell>
                <ExperienceStatusBadge status={stay.status} surface="light" />
              </DashboardTableCell>
              <DashboardTableCell>
                <Link
                  to="/homestay/properties/$homestayId"
                  params={{ homestayId: stay.id }}
                  className="luxury-btn-sm luxury-btn-primary inline-flex items-center no-underline"
                >
                  Manage
                </Link>
              </DashboardTableCell>
            </DashboardTableRow>
          ))}
        </DashboardTableBody>
      </DashboardTable>
    </DashboardTableScroll>
  );
}
