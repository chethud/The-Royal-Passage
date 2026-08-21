export function PayAtVenueBadge({ surface = "dark" }: { surface?: "light" | "dark" }) {
  const isLight = surface === "light";

  return (
    <div className="text-sm">
      <div className={`eyebrow ${isLight ? "luxury-panel-label" : "text-[#D4AF37]/90"}`}>Pay at venue</div>
      <p className={`mt-1.5 max-w-md leading-relaxed ${isLight ? "luxury-panel-body" : "text-muted-foreground/90"}`}>
        No online payment required. Pay your host in cash or UPI when you arrive at the experience.
      </p>
    </div>
  );
}
