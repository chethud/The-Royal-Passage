import { Link } from "@tanstack/react-router";

type CreateExperienceCtaProps = {
  variant?: "card" | "inline";
};

export function CreateExperienceCta({ variant = "card" }: CreateExperienceCtaProps) {
  const buttonClass =
    "inline-flex rounded-sm bg-ember px-6 py-3 text-sm font-medium tracking-wide text-primary-foreground shadow-[var(--shadow-gold)] transition-all hover:brightness-110";

  if (variant === "inline") {
    return (
      <Link to="/host/experiences/new" className={buttonClass}>
        Add experience
      </Link>
    );
  }

  return (
    <div className="glass-strong rounded-md border border-[oklch(0.88_0.08_86_/_0.15)] p-8 text-center">
      <h2 className="font-display text-2xl">Create your first experience</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        Add a listing with photos, pricing, and bookable slots. Submit for admin review when you are
        ready to go live.
      </p>
      <Link to="/host/experiences/new" className={`${buttonClass} mt-6`}>
        Add experience
      </Link>
    </div>
  );
}
