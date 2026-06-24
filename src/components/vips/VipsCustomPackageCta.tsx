import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { VIP_BOOKING_POLICY_LINE } from "@/lib/vip-filters";

type VipsCustomPackageCtaProps = {
  className?: string;
  compact?: boolean;
};

export function VipsCustomPackageCta({ className = "", compact = false }: VipsCustomPackageCtaProps) {
  return (
    <div
      className={`rounded-md border border-ember/25 bg-gradient-to-br from-ember/10 via-background to-[#4A0000]/5 px-6 py-8 sm:px-8 ${className}`}
    >
      <p className="eyebrow inline-flex items-center gap-2 text-ember/90">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Custom packages
      </p>
      <h2 className={`mt-3 font-display text-ink ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}>
        Build a package around your visit
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        None of our curated packages quite fit? Tell us your dates, group size, and interests — our
        concierge will design a fully customized Royal VIP itinerary for Mysuru. {VIP_BOOKING_POLICY_LINE}
      </p>
      <Link
        to="/contact"
        className="luxury-btn-sm luxury-btn-primary mt-6 inline-flex no-underline"
      >
        Request a custom package
      </Link>
    </div>
  );
}
