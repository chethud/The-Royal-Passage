import { UserRound } from "lucide-react";

type ProfileNavIconProps = {
  /** Outer circle diameter in pixels. */
  size?: number;
  className?: string;
};

export function ProfileNavIcon({ size = 40, className = "" }: ProfileNavIconProps) {
  const iconSize = Math.round(size * 0.5);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-[#C8A25A]/55 text-[#D4AF37] transition-colors group-hover:border-[#D4AF37]/80 group-hover:text-[#E8C878] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <UserRound style={{ width: iconSize, height: iconSize }} strokeWidth={1.75} />
    </span>
  );
}
