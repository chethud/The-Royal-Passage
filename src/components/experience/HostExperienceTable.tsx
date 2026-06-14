import { Link } from "@tanstack/react-router";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import type { HostExperienceSummary } from "@/lib/api/host-experiences";
import { formatMoney } from "@/lib/money";

type HostExperienceTableProps = {
  experiences: HostExperienceSummary[];
};

export function HostExperienceTable({ experiences }: HostExperienceTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead>
          <tr className="border-b text-xs uppercase tracking-[0.14em] luxury-panel-divider luxury-panel-label">
            <th className="px-3 py-2 font-medium">Experience</th>
            <th className="px-3 py-2 font-medium">City</th>
            <th className="px-3 py-2 font-medium">Price</th>
            <th className="px-3 py-2 font-medium">Slots</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {experiences.map((exp) => (
            <tr key={exp.id} className="border-b luxury-panel-divider">
              <td className="px-3 py-3">
                <div className="luxury-panel-heading font-display text-lg">{exp.title}</div>
                <div className="luxury-panel-body text-xs">{exp.slug}</div>
              </td>
              <td className="luxury-panel-body px-3 py-3">{exp.city}</td>
              <td className="luxury-panel-body px-3 py-3">
                {formatMoney(exp.pricePerPersonMinor, exp.currencySymbol)}
              </td>
              <td className="luxury-panel-body px-3 py-3">{exp.slotCount}</td>
              <td className="px-3 py-3">
                <ExperienceStatusBadge status={exp.status} surface="light" />
              </td>
              <td className="px-3 py-3">
                <Link
                  to="/host/experiences/$experienceId"
                  params={{ experienceId: exp.id }}
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
