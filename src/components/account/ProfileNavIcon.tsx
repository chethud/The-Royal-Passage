import { UserRound } from "lucide-react";

type ProfileNavIconProps = {
  /** Outer circle diameter in pixels. */
  size?: number;
  className?: string;
};

export function ProfileNavIcon({ size = 32, className = "" }: ProfileNavIconProps) {
  const iconSize = Math.round(size * 0.52);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-[#C8A25A]/60 bg-[#C8A25A]/12 text-[#D4AF6A] shadow-[0_0_22px_-8px_#c8a25a66] transition-colors group-hover:border-[#D4AF6A]/85 group-hover:bg-[#C8A25A]/22 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <UserRound style={{ width: iconSize, height: iconSize }} strokeWidth={1.75} />
    </span>
  );
}
