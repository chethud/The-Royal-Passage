import { Link } from "@tanstack/react-router";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";
import type { VipPackage } from "@/data/vips";
import { VIP_BOOKING_POLICY_LINE } from "@/lib/vip-filters";

type VipPackageEnquiryPanelProps = {
  pkg: VipPackage;
};

export function VipPackageEnquiryPanel({ pkg }: VipPackageEnquiryPanelProps) {
  const sym = pkg.currencySymbol ?? "₹";

  return (
    <LuxuryCheckoutPanel className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
      <p className="luxury-panel-heading font-display text-2xl">Enquire about this package</p>

      <dl className="mt-4 space-y-3 border-b border-[rgb(74_0_0/0.12)] pb-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Starting from</dt>
          <dd className="font-display text-base text-ink">
            {sym}
            {pkg.priceFrom.toLocaleString("en-IN")}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Duration</dt>
          <dd>
            {pkg.durationDays} day{pkg.durationDays === 1 ? "" : "s"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Group size</dt>
          <dd>Up to {pkg.maxGuests} guests</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Package type</dt>
          <dd>{pkg.packageType}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Location</dt>
          <dd>{pkg.city}</dd>
        </div>
      </dl>

      <p className="luxury-panel-body mt-4 text-sm">
        Share your travel dates and group size — our concierge will confirm inclusions, final pricing,
        and availability for this package.
      </p>
      <p className="luxury-panel-body mt-3 text-xs leading-relaxed text-muted-foreground">
        {VIP_BOOKING_POLICY_LINE}
      </p>

      <Link
        to="/contact"
        className="luxury-btn-sm luxury-btn-primary mt-6 inline-flex w-full justify-center no-underline"
      >
        Contact concierge
      </Link>
      <Link
        to="/contact"
        className="luxury-btn-sm luxury-btn-secondary mt-3 inline-flex w-full justify-center no-underline"
      >
        Request a custom package
      </Link>
    </LuxuryCheckoutPanel>
  );
}
