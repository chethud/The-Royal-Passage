import type { ReactNode } from "react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
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
import type { AdminExperienceDetail } from "@/lib/api/admin";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

type AdminExperienceReviewProps = {
  experience: AdminExperienceDetail;
};

function DetailBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="eyebrow luxury-panel-label">{label}</dt>
      <dd className="luxury-panel-body mt-1 text-sm">{children}</dd>
    </div>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <dt className="eyebrow luxury-panel-label">{label}</dt>
      <dd className="mt-1">
        <ul className="luxury-panel-body list-disc space-y-1 pl-5 text-sm">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </dd>
    </div>
  );
}

export function AdminExperienceReview({ experience }: AdminExperienceReviewProps) {
  const hero = experience.heroImageUrl ?? experience.galleryUrls[0] ?? null;
  const gallery = experience.galleryUrls.filter((url) => url !== hero);

  return (
    <div className="space-y-6">
      {hero ? (
        <div className="luxury-panel-image overflow-hidden rounded-md">
          <img
            src={hero}
            alt={experience.title}
            className="aspect-[21/9] w-full object-cover md:aspect-[3/1]"
          />
        </div>
      ) : null}

      <LuxuryCheckoutPanel>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <ExperienceStatusBadge status={experience.status} />
              <span className="luxury-panel-body text-sm">
                Submitted {formatDateLong(experience.createdAt.slice(0, 10))}
              </span>
            </div>
            <h2 className="luxury-panel-heading mt-3 font-display text-3xl md:text-4xl">
              {experience.title}
            </h2>
            {experience.tagline ? (
              <p className="luxury-panel-body mt-2 text-base">{experience.tagline}</p>
            ) : null}
          </div>
          <div className="text-right">
            <div className="eyebrow luxury-panel-label">Price</div>
            <div className="luxury-panel-heading font-display text-2xl">
              {formatMoney(experience.pricePerPersonMinor, experience.currencySymbol)}
            </div>
            <div className="luxury-panel-body text-xs">per person</div>
          </div>
        </div>
      </LuxuryCheckoutPanel>

      {gallery.length > 0 ? (
        <LuxuryCheckoutPanel>
          <h3 className="eyebrow luxury-panel-label mb-3">Gallery</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((url) => (
              <div key={url} className="luxury-panel-image overflow-hidden rounded-sm">
                <img src={url} alt={experience.title} className="aspect-[4/3] w-full object-cover" />
              </div>
            ))}
          </div>
        </LuxuryCheckoutPanel>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <LuxuryCheckoutPanel>
          <h3 className="luxury-panel-heading font-display text-xl">Host</h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailBlock label="Name">{experience.hostName}</DetailBlock>
            <DetailBlock label="Verified">{experience.hostVerified ? "Yes" : "No"}</DetailBlock>
            {experience.hostEmail ? (
              <DetailBlock label="Email">{experience.hostEmail}</DetailBlock>
            ) : null}
            {experience.hostPhone ? (
              <DetailBlock label="Phone">{experience.hostPhone}</DetailBlock>
            ) : null}
            {experience.hostBio ? (
              <div className="sm:col-span-2">
                <DetailBlock label="Bio">{experience.hostBio}</DetailBlock>
              </div>
            ) : null}
          </dl>
        </LuxuryCheckoutPanel>

        <LuxuryCheckoutPanel>
          <h3 className="luxury-panel-heading font-display text-xl">Location & logistics</h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailBlock label="Category">{experience.categoryLabel}</DetailBlock>
            <DetailBlock label="Duration">{experience.durationMinutes} minutes</DetailBlock>
            <DetailBlock label="City">
              {experience.city}
              {experience.region ? `, ${experience.region}` : ""}
            </DetailBlock>
            {experience.address ? (
              <DetailBlock label="Address">{experience.address}</DetailBlock>
            ) : null}
            {experience.mapLink ? (
              <DetailBlock label="Map link">
                <a
                  href={experience.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="luxury-panel-link break-all underline-offset-4 hover:underline"
                >
                  Open in maps
                </a>
              </DetailBlock>
            ) : null}
            <DetailBlock label="Guests per booking">
              {experience.minGuestsPerBooking}–{experience.maxGuestsPerBooking}
            </DetailBlock>
            <DetailBlock label="URL slug">{experience.slug}</DetailBlock>
          </dl>
        </LuxuryCheckoutPanel>
      </div>

      {experience.description ? (
        <LuxuryCheckoutPanel>
          <h3 className="luxury-panel-heading font-display text-xl">Description</h3>
          <p className="luxury-panel-body mt-3 whitespace-pre-wrap text-sm leading-relaxed">
            {experience.description}
          </p>
        </LuxuryCheckoutPanel>
      ) : null}

      <LuxuryCheckoutPanel>
        <h3 className="luxury-panel-heading font-display text-xl">Inclusions & policies</h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ListBlock label="Inclusions" items={experience.inclusions} />
          <ListBlock label="Exclusions" items={experience.exclusions} />
          <ListBlock label="Requirements" items={experience.requirements} />
        </div>
        {experience.cancellationPolicy ? (
          <div className="mt-6 border-t luxury-panel-divider pt-5">
            <DetailBlock label="Cancellation policy">
              <span className="whitespace-pre-wrap">{experience.cancellationPolicy}</span>
            </DetailBlock>
          </div>
        ) : null}
      </LuxuryCheckoutPanel>

      <LuxuryCheckoutPanel>
        <h3 className="luxury-panel-heading font-display text-xl">Bookable slots</h3>
        <p className="luxury-panel-body mt-1 text-sm">
          Guests can book these dates once you approve and publish.
        </p>
        {experience.slots.length === 0 ? (
          <p className="mt-4 rounded-sm border border-amber-600/30 bg-amber-50/80 px-4 py-3 text-sm text-amber-900/90">
            No slots added yet. Ask the host to add dates before publishing, or reject and request
            slots.
          </p>
        ) : (
          <div className="mt-4">
            <DashboardTableScroll>
              <DashboardTable minWidth="sm">
                <DashboardTableHead>
                  <DashboardTableHeadRow>
                    <DashboardTableHeadCell>Date</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Time</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Capacity</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Available</DashboardTableHeadCell>
                    <DashboardTableHeadCell>Status</DashboardTableHeadCell>
                  </DashboardTableHeadRow>
                </DashboardTableHead>
                <DashboardTableBody>
                  {experience.slots.map((slot) => (
                    <DashboardTableRow key={slot.id}>
                      <DashboardTableCell>{formatDateLong(slot.date)}</DashboardTableCell>
                      <DashboardTableCell>
                        {slot.start} – {slot.end}
                      </DashboardTableCell>
                      <DashboardTableCell>{slot.capacity}</DashboardTableCell>
                      <DashboardTableCell>{slot.available}</DashboardTableCell>
                      <DashboardTableCell>{slot.isBlocked ? "Blocked" : "Open"}</DashboardTableCell>
                    </DashboardTableRow>
                  ))}
                </DashboardTableBody>
              </DashboardTable>
            </DashboardTableScroll>
          </div>
        )}
      </LuxuryCheckoutPanel>
    </div>
  );
}
