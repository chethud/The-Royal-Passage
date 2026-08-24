import { Link } from "@tanstack/react-router";
import { Building2, Home, Landmark, MapPin, type LucideIcon } from "lucide-react";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import type { OwnerHomestaySummary } from "@/lib/api/owner-homestays";
import { formatMoney } from "@/lib/money";

type OwnerHomestayTableProps = {
  homestays: OwnerHomestaySummary[];
};

function propertyIconForTitle(title: string): LucideIcon {
  const key = title.toLowerCase();
  if (key.includes("palace") || key.includes("heritage") || key.includes("haveli")) return Landmark;
  if (key.includes("resort") || key.includes("hotel")) return Building2;
  return Home;
}

function PropertyMedallion({ stay }: { stay: OwnerHomestaySummary }) {
  const Icon = propertyIconForTitle(stay.title);
  if (stay.image) {
    return (
      <span className="host-catalog-medallion host-catalog-medallion--photo" aria-hidden>
        <img src={stay.image} alt="" />
      </span>
    );
  }
  return (
    <span className="host-catalog-medallion" aria-hidden>
      <Icon className="host-catalog-medallion__icon" />
    </span>
  );
}

export function OwnerHomestayTable({ homestays }: OwnerHomestayTableProps) {
  return (
    <>
      <div className="host-catalog-table-wrap" role="region" aria-label="Properties">
        <table className="host-catalog-table">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">City</th>
              <th scope="col">From / night</th>
              <th scope="col">Rooms</th>
              <th scope="col">Status</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {homestays.map((stay) => (
              <tr key={stay.id}>
                <td>
                  <div className="host-catalog-item">
                    <PropertyMedallion stay={stay} />
                    <div className="host-catalog-item__copy">
                      <span className="host-catalog-item__title">{stay.title}</span>
                      <span className="host-catalog-item__slug">{stay.slug}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="host-catalog-city">
                    <MapPin className="host-catalog-city__icon" aria-hidden />
                    {stay.city}
                  </span>
                </td>
                <td>
                  <span className="host-catalog-price">
                    {formatMoney(stay.pricePerNightMinor, stay.currencySymbol)}
                  </span>
                </td>
                <td>
                  <span className="host-catalog-slots">{stay.roomCount}</span>
                </td>
                <td>
                  <ExperienceStatusBadge status={stay.status} surface="light" />
                </td>
                <td>
                  <Link
                    to="/homestay/properties/$homestayId"
                    params={{ homestayId: stay.id }}
                    className="host-catalog-manage-btn"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="host-catalog-cards">
        {homestays.map((stay) => (
          <li key={stay.id} className="host-catalog-card">
            <div className="host-catalog-item">
              <PropertyMedallion stay={stay} />
              <div className="host-catalog-item__copy">
                <span className="host-catalog-item__title">{stay.title}</span>
                <span className="host-catalog-item__slug">{stay.slug}</span>
              </div>
            </div>

            <div className="host-catalog-card__row">
              <span className="host-catalog-card__label">City</span>
              <span className="host-catalog-city">
                <MapPin className="host-catalog-city__icon" aria-hidden />
                {stay.city}
              </span>
            </div>

            <div className="host-catalog-card__row">
              <span className="host-catalog-card__label">From / night</span>
              <span className="host-catalog-price">
                {formatMoney(stay.pricePerNightMinor, stay.currencySymbol)}
              </span>
            </div>

            <div className="host-catalog-card__row">
              <span className="host-catalog-card__label">Rooms</span>
              <span className="host-catalog-slots">{stay.roomCount}</span>
            </div>

            <div className="host-catalog-card__row">
              <span className="host-catalog-card__label">Status</span>
              <ExperienceStatusBadge status={stay.status} surface="light" />
            </div>

            <div className="host-catalog-card__actions">
              <Link
                to="/homestay/properties/$homestayId"
                params={{ homestayId: stay.id }}
                className="host-catalog-manage-btn"
              >
                Manage
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
