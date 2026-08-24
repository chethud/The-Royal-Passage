import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";

type CreateExperienceCtaProps = {
  variant?: "card" | "inline";
  tone?: "default" | "royal";
};

export function CreateExperienceCta({ variant = "card", tone = "default" }: CreateExperienceCtaProps) {
  const buttonClass =
    tone === "royal"
      ? "host-catalog-cta inline-flex items-center gap-2 no-underline"
      : "luxury-btn-sm luxury-btn-primary inline-flex items-center no-underline";

  if (variant === "inline") {
    return (
      <Link to="/host/experiences/new" resetScroll className={buttonClass}>
        {tone === "royal" ? <Plus className="host-catalog-cta__icon" aria-hidden /> : null}
        Add experience
      </Link>
    );
  }

  return (
    <LuxuryCheckoutPanel className="text-center">
      <h2 className="luxury-panel-heading font-display text-2xl">Create your first experience</h2>
      <p className="luxury-panel-body mx-auto mt-3 max-w-md text-sm">
        Add a listing with photos, pricing, and bookable slots. At least one session timing is
        required before you can submit for admin review.
      </p>
      <Link to="/host/experiences/new" resetScroll className={`${buttonClass} mt-6`}>
        Add experience
      </Link>
    </LuxuryCheckoutPanel>
  );
}
