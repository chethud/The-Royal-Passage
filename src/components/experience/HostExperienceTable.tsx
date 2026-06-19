import { Link } from "@tanstack/react-router";
import { CalendarDays, Pencil } from "lucide-react";
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
import type { HostExperienceSummary } from "@/lib/api/host-experiences";
import { formatMoney } from "@/lib/money";

type HostExperienceTableProps = {
  experiences: HostExperienceSummary[];
};

const actionLinkClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[oklch(0.72_0.09_78_/_0.35)] bg-[oklch(0.78_0.13_86_/_0.22)] text-[#4A0000] no-underline transition-colors hover:border-ember/55 hover:bg-[oklch(0.78_0.13_86_/_0.35)] hover:text-[#3A0000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60";

export function HostExperienceTable({ experiences }: HostExperienceTableProps) {
  return (
    <DashboardTableScroll>
      <DashboardTable minWidth="md">
        <DashboardTableHead>
          <DashboardTableHeadRow>
            <DashboardTableHeadCell>Experience</DashboardTableHeadCell>
            <DashboardTableHeadCell>City</DashboardTableHeadCell>
            <DashboardTableHeadCell>Price</DashboardTableHeadCell>
            <DashboardTableHeadCell>Slots</DashboardTableHeadCell>
            <DashboardTableHeadCell>Status</DashboardTableHeadCell>
            <DashboardTableHeadCell>Manage</DashboardTableHeadCell>
            <DashboardTableHeadCell>Edit</DashboardTableHeadCell>
          </DashboardTableHeadRow>
        </DashboardTableHead>
        <DashboardTableBody>
          {experiences.map((exp) => (
            <DashboardTableRow key={exp.id}>
              <DashboardTableCell variant="heading">
                <div className="font-display text-lg">{exp.title}</div>
                <div className="luxury-panel-body text-xs">{exp.slug}</div>
              </DashboardTableCell>
              <DashboardTableCell>{exp.city}</DashboardTableCell>
              <DashboardTableCell>
                {formatMoney(exp.pricePerPersonMinor, exp.currencySymbol)}
              </DashboardTableCell>
              <DashboardTableCell>{exp.slotCount}</DashboardTableCell>
              <DashboardTableCell>
                <ExperienceStatusBadge status={exp.status} surface="light" />
              </DashboardTableCell>
              <DashboardTableCell>
                <Link
                  to="/host/experiences/$experienceId"
                  params={{ experienceId: exp.id }}
                  search={{ section: "sessions" }}
                  aria-label={`Manage session timings for ${exp.title}`}
                  title="Session timings"
                  className={actionLinkClass}
                >
                  <CalendarDays className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </Link>
              </DashboardTableCell>
              <DashboardTableCell>
                <Link
                  to="/host/experiences/$experienceId"
                  params={{ experienceId: exp.id }}
                  search={{ section: "details" }}
                  aria-label={`Edit listing details for ${exp.title}`}
                  title="Listing details"
                  className={actionLinkClass}
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </Link>
              </DashboardTableCell>
            </DashboardTableRow>
          ))}
        </DashboardTableBody>
      </DashboardTable>
    </DashboardTableScroll>
  );
}
