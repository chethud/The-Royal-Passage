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
import type { OwnerVipPackageSummary } from "@/lib/api/owner-vip-packages";
import { formatMoney } from "@/lib/money";

type OwnerVipPackageTableProps = {
  packages: OwnerVipPackageSummary[];
};

export function OwnerVipPackageTable({ packages }: OwnerVipPackageTableProps) {
  return (
    <DashboardTableScroll>
      <DashboardTable minWidth="lg">
        <DashboardTableHead>
          <DashboardTableHeadRow>
            <DashboardTableHeadCell>Package</DashboardTableHeadCell>
            <DashboardTableHeadCell>Type</DashboardTableHeadCell>
            <DashboardTableHeadCell>City</DashboardTableHeadCell>
            <DashboardTableHeadCell>From</DashboardTableHeadCell>
            <DashboardTableHeadCell>Duration</DashboardTableHeadCell>
            <DashboardTableHeadCell>Status</DashboardTableHeadCell>
            <DashboardTableHeadCell>Actions</DashboardTableHeadCell>
          </DashboardTableHeadRow>
        </DashboardTableHead>
        <DashboardTableBody>
          {packages.map((pkg) => (
            <DashboardTableRow key={pkg.id}>
              <DashboardTableCell variant="heading">
                <div className="font-display text-lg">{pkg.title}</div>
                <div className="luxury-panel-body text-xs">{pkg.slug}</div>
              </DashboardTableCell>
              <DashboardTableCell>{pkg.packageType}</DashboardTableCell>
              <DashboardTableCell>{pkg.city}</DashboardTableCell>
              <DashboardTableCell>
                {formatMoney(pkg.priceFromMinor, pkg.currencySymbol)}
              </DashboardTableCell>
              <DashboardTableCell>
                {pkg.durationDays} day{pkg.durationDays === 1 ? "" : "s"}
              </DashboardTableCell>
              <DashboardTableCell>
                <ExperienceStatusBadge status={pkg.status} surface="light" />
              </DashboardTableCell>
              <DashboardTableCell>
                <Link
                  to="/vip/listings/$packageId"
                  params={{ packageId: pkg.id }}
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
