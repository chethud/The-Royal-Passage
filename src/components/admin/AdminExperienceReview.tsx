import type { ReactNode } from "react";
import { ExperienceStatusBadge } from "@/components/experience/ExperienceStatusBadge";
import type { AdminExperienceDetail } from "@/lib/api/admin";
import { formatDateLong } from "@/lib/date-format";
import { formatMoney } from "@/lib/money";

type AdminExperienceReviewProps = {
  experience: AdminExperienceDetail;
};

function DetailBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <dt className="eyebrow text-muted-foreground">{label}</dt>
      <dd className="mt-1">
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
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
        <div className="overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.2)]">
          <img
            src={hero}
            alt={experience.title}
            className="aspect-[21/9] w-full object-cover md:aspect-[3/1]"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <ExperienceStatusBadge status={experience.status} />
            <span className="text-sm text-muted-foreground">
              Submitted {formatDateLong(experience.createdAt.slice(0, 10))}
            </span>
          </div>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">{experience.title}</h2>
          {experience.tagline ? (
            <p className="mt-2 text-base text-muted-foreground">{experience.tagline}</p>
          ) : null}
        </div>
        <div className="text-right">
          <div className="eyebrow text-muted-foreground">Price</div>
          <div className="font-display text-2xl text-ember">
            {formatMoney(experience.pricePerPersonMinor, experience.currencySymbol)}
          </div>
          <div className="text-xs text-muted-foreground">per person</div>
        </div>
      </div>

      {gallery.length > 0 ? (
        <section>
          <h3 className="eyebrow mb-3 text-muted-foreground">Gallery</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((url) => (
              <div
                key={url}
                className="overflow-hidden rounded-sm border border-[oklch(0.88_0.08_86_/_0.25)]"
              >
                <img src={url} alt={experience.title} className="aspect-[4/3] w-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5 sm:p-6">
          <h3 className="font-display text-xl">Host</h3>
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
        </section>

        <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5 sm:p-6">
          <h3 className="font-display text-xl">Location & logistics</h3>
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
            <DetailBlock label="Guests per booking">
              {experience.minGuestsPerBooking}–{experience.maxGuestsPerBooking}
            </DetailBlock>
            <DetailBlock label="URL slug">{experience.slug}</DetailBlock>
          </dl>
        </section>
      </div>

      {experience.description ? (
        <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5 sm:p-6">
          <h3 className="font-display text-xl">Description</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {experience.description}
          </p>
        </section>
      ) : null}

      <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5 sm:p-6">
        <h3 className="font-display text-xl">Inclusions & policies</h3>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ListBlock label="Inclusions" items={experience.inclusions} />
          <ListBlock label="Exclusions" items={experience.exclusions} />
          <ListBlock label="Requirements" items={experience.requirements} />
        </div>
        {experience.cancellationPolicy ? (
          <div className="mt-6 border-t border-[oklch(0.88_0.08_86_/_0.15)] pt-5">
            <DetailBlock label="Cancellation policy">
              <span className="whitespace-pre-wrap text-muted-foreground">
                {experience.cancellationPolicy}
              </span>
            </DetailBlock>
          </div>
        ) : null}
      </section>

      <section className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-5 sm:p-6">
        <h3 className="font-display text-xl">Bookable slots</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Guests can book these dates once you approve and publish.
        </p>
        {experience.slots.length === 0 ? (
          <p className="mt-4 rounded-sm border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
            No slots added yet. Ask the host to add dates before publishing, or reject and request
            slots.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[oklch(0.88_0.08_86_/_0.2)] text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Capacity</th>
                  <th className="px-3 py-2">Available</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {experience.slots.map((slot) => (
                  <tr key={slot.id} className="border-b border-[oklch(0.88_0.08_86_/_0.1)]">
                    <td className="px-3 py-3">{formatDateLong(slot.date)}</td>
                    <td className="px-3 py-3">
                      {slot.start} – {slot.end}
                    </td>
                    <td className="px-3 py-3">{slot.capacity}</td>
                    <td className="px-3 py-3">{slot.available}</td>
                    <td className="px-3 py-3">{slot.isBlocked ? "Blocked" : "Open"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
