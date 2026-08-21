export function PayAtHomestayBadge({ surface = "dark" }: { surface?: "light" | "dark" }) {
  const isLight = surface === "light";

  return (
    <div className="text-sm">
      <div className={`eyebrow ${isLight ? "luxury-panel-label" : "text-[#D4AF37]/90"}`}>
        Pay at the homestay
      </div>
      <p className={`mt-1.5 max-w-md leading-relaxed ${isLight ? "luxury-panel-body" : "text-muted-foreground/90"}`}>
        Cash only. No online payment — pay your host in cash when you arrive for check-in.
      </p>
    </div>
  );
}
