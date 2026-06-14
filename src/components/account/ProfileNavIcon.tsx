import { Crown } from "lucide-react";

type ProfileNavIconProps = {
  /** Outer medallion diameter in pixels. */
  size?: number;
  className?: string;
  /** Larger medallion styling for dropdown / mobile account headers. */
  variant?: "nav" | "section";
};

export function ProfileNavIcon({ size = 40, className = "", variant = "nav" }: ProfileNavIconProps) {
  const iconSize = Math.round(size * (variant === "section" ? 0.38 : 0.42));

  return (
    <span
      className={`header-profile-medallion shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Crown
        style={{ width: iconSize, height: iconSize }}
        strokeWidth={1.85}
        className="relative z-[1] drop-shadow-[0_1px_0_#f8f4e866]"
      />
    </span>
  );
}
