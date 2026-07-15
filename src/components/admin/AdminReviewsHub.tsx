import { Link } from "@tanstack/react-router";
import { LuxuryCheckoutPanel } from "@/components/booking/LuxuryCheckoutPanel";

type AdminReviewsHubProps = {
  scope?: "both" | "experience" | "homestay";
  /** When true, detail links include ?from=hub for back navigation to /admin/reviews. */
  linkFromHub?: boolean;
};

function ReviewNavCard({
  to,
  search,
  title,
  detail,
}: {
  to: "/admin/reviews/experiences" | "/admin/reviews/homestays";
  search?: { from: "hub" };
  title: string;
  detail: string;
}) {
  return (
    <Link
      to={to}
      search={search}
      className="block rounded-md border border-[rgb(74_0_0/0.14)] bg-[rgb(255_255_255/0.35)] p-5 transition-colors hover:border-[rgb(74_0_0/0.28)] no-underline"
    >
      <div className="luxury-panel-heading font-display text-lg">{title}</div>
      <p className="luxury-panel-body mt-1 text-sm">{detail}</p>
      <span className="luxury-panel-label mt-3 inline-block text-xs uppercase tracking-[0.12em]">
        Open reviews →
      </span>
    </Link>
  );
}

export function AdminReviewsHub({ scope = "both", linkFromHub = false }: AdminReviewsHubProps) {
  const showExperience = scope === "both" || scope === "experience";
  const showHomestay = scope === "both" || scope === "homestay";
  const hubSearch = linkFromHub ? ({ from: "hub" as const }) : undefined;

  const heading =
    scope === "experience"
      ? "Experience reviews"
      : scope === "homestay"
        ? "Homestay reviews"
        : "Reviews moderation";

  const blurb =
    scope === "experience"
      ? "Open to view and moderate top experience guest reviews."
      : scope === "homestay"
        ? "Open to view and moderate top homestay guest reviews."
        : "Choose a category to view and moderate guest reviews.";

  return (
    <LuxuryCheckoutPanel>
      <h2 className="luxury-panel-heading font-display text-2xl">{heading}</h2>
      <p className="luxury-panel-body mt-1 text-sm">{blurb}</p>

      <div
        className={
          scope === "both" ? "mt-6 grid gap-4 md:grid-cols-2" : "mt-6 max-w-md"
        }
      >
        {showExperience ? (
          <ReviewNavCard
            to="/admin/reviews/experiences"
            search={hubSearch}
            title="Experience"
            detail="Top 5 experience reviews by rating"
          />
        ) : null}
        {showHomestay ? (
          <ReviewNavCard
            to="/admin/reviews/homestays"
            search={hubSearch}
            title="Homestay"
            detail="Top 5 homestay reviews by rating"
          />
        ) : null}
      </div>
    </LuxuryCheckoutPanel>
  );
}
