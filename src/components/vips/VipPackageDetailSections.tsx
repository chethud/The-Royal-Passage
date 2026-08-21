import { Check, MapPin } from "lucide-react";
import { DetailDarkSection } from "@/components/detail/DetailPageLayout";
import type { VipPackage } from "@/data/vips";

type VipPackageDetailSectionsProps = {
  pkg: VipPackage;
};

export function VipPackageDetailSections({ pkg }: VipPackageDetailSectionsProps) {
  const locationLine = [pkg.region, pkg.city].filter(Boolean).join(" · ");

  return (
    <div className="space-y-8">
      <DetailDarkSection label="Package overview" className="mt-0">
        <p className="text-sm leading-relaxed text-[#D6C8B5]/90">{pkg.description}</p>
      </DetailDarkSection>

      {pkg.itinerary.length > 0 ? (
        <DetailDarkSection label="Day-by-day itinerary">
          <ol className="space-y-5">
            {pkg.itinerary.map((day) => (
              <li key={day.day} className="border-l border-[#D4AF37]/35 pl-4">
                <p className="eyebrow text-[0.58rem] text-[#D4AF37]/90">
                  Day {day.day}
                </p>
                <p className="mt-1 font-display text-lg text-[#F7F1E8]">{day.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#D6C8B5]/85">{day.detail}</p>
              </li>
            ))}
          </ol>
        </DetailDarkSection>
      ) : null}

      {pkg.highlights.length > 0 ? (
        <DetailDarkSection label="What's included">
          <ul className="space-y-2.5">
            {pkg.highlights.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm leading-relaxed text-[#D6C8B5]/90"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </DetailDarkSection>
      ) : null}

      {pkg.goodToKnow && pkg.goodToKnow.length > 0 ? (
        <DetailDarkSection label="Good to know">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#D6C8B5]/85">
            {pkg.goodToKnow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </DetailDarkSection>
      ) : null}

      {pkg.conciergeNote ? (
        <DetailDarkSection label="From your concierge">
          <p className="rounded-sm border border-[#D4AF37]/25 bg-[#D4AF37]/8 px-4 py-3 text-sm leading-relaxed text-[#E8DCC8]/90">
            {pkg.conciergeNote}
          </p>
        </DetailDarkSection>
      ) : null}

      <DetailDarkSection label="Where this package runs">
        <p className="inline-flex items-center gap-2 font-display text-xl text-[#F7F1E8]">
          <MapPin className="h-5 w-5 text-[#D4AF37]" aria-hidden />
          {locationLine}
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#D6C8B5]/80">
          Royal Passage coordinates venues, transfers, and hosts across Mysuru for this package.
          Exact timings are confirmed with your concierge after enquiry.
        </p>
      </DetailDarkSection>
    </div>
  );
}
