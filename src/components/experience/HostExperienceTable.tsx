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
          <tr className="border-b border-[oklch(0.88_0.08_86_/_0.2)] text-xs uppercase tracking-[0.14em] text-muted-foreground">
            <th className="px-3 py-2">Experience</th>
            <th className="px-3 py-2">City</th>
            <th className="px-3 py-2">Price</th>
            <th className="px-3 py-2">Slots</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {experiences.map((exp) => (
            <tr key={exp.id} className="border-b border-[oklch(0.88_0.08_86_/_0.1)]">
              <td className="px-3 py-3">
                <div className="font-display text-lg">{exp.title}</div>
                <div className="text-xs text-muted-foreground">{exp.slug}</div>
              </td>
              <td className="px-3 py-3">{exp.city}</td>
              <td className="px-3 py-3">
                {formatMoney(exp.pricePerPersonMinor, exp.currencySymbol)}
              </td>
              <td className="px-3 py-3">{exp.slotCount}</td>
              <td className="px-3 py-3">
                <ExperienceStatusBadge status={exp.status} />
              </td>
              <td className="px-3 py-3">
                <Link
                  to="/host/experiences/$experienceId"
                  params={{ experienceId: exp.id }}
                  className="text-ember hover:underline"
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
