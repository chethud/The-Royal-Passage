import { Link } from "@tanstack/react-router";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";

type CreateExperienceCtaProps = {
  variant?: "card" | "inline";
};

export function CreateExperienceCta({ variant = "card" }: CreateExperienceCtaProps) {
  const buttonClass = "luxury-btn-sm luxury-btn-primary inline-flex items-center no-underline";

  if (variant === "inline") {
    return (
      <Link to="/host/experiences/new" resetScroll className={buttonClass}>
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
