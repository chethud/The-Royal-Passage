import { Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Coffee,
  Dumbbell,
  MapPin,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import type { HostExperienceSummary } from "@/lib/api/host-experiences";
import { categoryIconForLabel } from "@/lib/experience-category-icons";
import { formatMoney } from "@/lib/money";

type HostExperienceTableProps = {
  experiences: HostExperienceSummary[];
};

function experienceIconForTitle(title: string): LucideIcon {
  const key = title.toLowerCase();
  if (key.includes("coffee") || key.includes("roast") || key.includes("brew")) return Coffee;
  if (
    key.includes("weight") ||
    key.includes("strength") ||
    key.includes("fitness") ||
    key.includes("gym")
  ) {
    return Dumbbell;
  }
  return categoryIconForLabel(title);
}

function ExperienceMedallion({ exp }: { exp: HostExperienceSummary }) {
  const Icon = experienceIconForTitle(exp.title);
  if (exp.image) {
    return (
      <span className="host-catalog-medallion host-catalog-medallion--photo" aria-hidden>
        <img src={exp.image} alt="" />
      </span>
    );
  }
  return (
    <span className="host-catalog-medallion" aria-hidden>
      <Icon className="host-catalog-medallion__icon" />
    </span>
  );
}

export function HostExperienceTable({ experiences }: HostExperienceTableProps) {
  return (
    <>
      <div className="host-catalog-table-wrap" role="region" aria-label="Experiences">
        <table className="host-catalog-table">
          <thead>
            <tr>
              <th scope="col">Experience</th>
              <th scope="col">City</th>
              <th scope="col">Price</th>
              <th scope="col">Slots</th>
              <th scope="col">Status</th>
              <th scope="col">Manage</th>
              <th scope="col">Edit</th>
            </tr>
          </thead>
          <tbody>
            {experiences.map((exp) => (
              <tr key={exp.id}>
                <td>
                  <div className="host-catalog-item">
                    <ExperienceMedallion exp={exp} />
                    <div className="host-catalog-item__copy">
                      <span className="host-catalog-item__title">{exp.title}</span>
                      <span className="host-catalog-item__slug">{exp.slug}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="host-catalog-city">
                    <MapPin className="host-catalog-city__icon" aria-hidden />
                    {exp.city}
                  </span>
                </td>
                <td>
                  <span className="host-catalog-price">
                    {formatMoney(exp.pricePerPersonMinor, exp.currencySymbol)}
                  </span>
                </td>
                <td>
                  <span className="host-catalog-slots">{exp.slotCount}</span>
                </td>
                <td>
                  <ExperienceStatusBadge status={exp.status} surface="light" />
                </td>
                <td>
                  <Link
                    to="/host/experiences/$experienceId"
                    params={{ experienceId: exp.id }}
                    search={{ section: "sessions" }}
                    aria-label={`Manage session timings for ${exp.title}`}
                    title="Session timings"
                    className="host-catalog-action"
                  >
                    <CalendarDays className="host-catalog-action__icon" strokeWidth={1.75} aria-hidden />
                  </Link>
                </td>
                <td>
                  <Link
                    to="/host/experiences/$experienceId"
                    params={{ experienceId: exp.id }}
                    search={{ section: "details" }}
                    aria-label={`Edit listing details for ${exp.title}`}
                    title="Listing details"
                    className="host-catalog-action"
                  >
                    <Pencil className="host-catalog-action__icon" strokeWidth={1.75} aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="host-catalog-cards">
        {experiences.map((exp) => (
          <li key={exp.id} className="host-catalog-card">
            <div className="host-catalog-item">
              <ExperienceMedallion exp={exp} />
              <div className="host-catalog-item__copy">
                <span className="host-catalog-item__title">{exp.title}</span>
                <span className="host-catalog-item__slug">{exp.slug}</span>
              </div>
            </div>

            <div className="host-catalog-card__row">
              <span className="host-catalog-card__label">City</span>
              <span className="host-catalog-city">
                <MapPin className="host-catalog-city__icon" aria-hidden />
                {exp.city}
              </span>
            </div>

            <div className="host-catalog-card__row">
              <span className="host-catalog-card__label">Price</span>
              <span className="host-catalog-price">
                {formatMoney(exp.pricePerPersonMinor, exp.currencySymbol)}
              </span>
            </div>

            <div className="host-catalog-card__row">
              <span className="host-catalog-card__label">Slots</span>
              <span className="host-catalog-slots">{exp.slotCount}</span>
            </div>

            <div className="host-catalog-card__row">
              <span className="host-catalog-card__label">Status</span>
              <ExperienceStatusBadge status={exp.status} surface="light" />
            </div>

            <div className="host-catalog-card__actions">
              <Link
                to="/host/experiences/$experienceId"
                params={{ experienceId: exp.id }}
                search={{ section: "sessions" }}
                aria-label={`Manage session timings for ${exp.title}`}
                title="Session timings"
                className="host-catalog-action"
              >
                <CalendarDays className="host-catalog-action__icon" strokeWidth={1.75} aria-hidden />
              </Link>
              <Link
                to="/host/experiences/$experienceId"
                params={{ experienceId: exp.id }}
                search={{ section: "details" }}
                aria-label={`Edit listing details for ${exp.title}`}
                title="Listing details"
                className="host-catalog-action"
              >
                <Pencil className="host-catalog-action__icon" strokeWidth={1.75} aria-hidden />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
