import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 32 32",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Classical amphora — pottery & craft */
export function RoyalPotteryIcon({ strokeWidth = 1.15, ...props }: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={strokeWidth} {...props}>
      <path d="M11.5 8.5 C 11.5 6.5, 13 5, 16 5 C 19 5, 20.5 6.5, 20.5 8.5" />
      <path d="M10 8.5 L10 10.5 C 8.5 11.5, 7.5 13.5, 7.5 16 C 7.5 21, 10.5 25, 16 26.5 C 21.5 25, 24.5 21, 24.5 16 C 24.5 13.5, 23.5 11.5, 22 10.5 L22 8.5" />
      <path d="M12.5 14 Q 16 12.5, 19.5 14" opacity="0.75" />
      <path d="M11.5 18 Q 16 16.5, 20.5 18" opacity="0.75" />
      <path d="M12.5 21.5 Q 16 20, 19.5 21.5" opacity="0.75" />
      <path d="M6.5 14.5 C 5.5 15.5, 5 16.5, 5 17.5" />
      <path d="M25.5 14.5 C 26.5 15.5, 27 16.5, 27 17.5" />
      <circle cx="16" cy="7.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

/** Ornate brazier flame — outdoor cooking */
export function RoyalFlameIcon({ strokeWidth = 1.15, ...props }: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={strokeWidth} {...props}>
      <path d="M7 24 L25 24" />
      <path d="M9 24 L9 21.5 L23 21.5 L23 24" />
      <path d="M11 21.5 L11 19.5 C 11 17.5, 12.5 16, 14.5 16 L17.5 16 C 19.5 16, 21 17.5, 21 19.5 L21 21.5" />
      <path d="M16 16 C 14.5 13.5, 15 10.5, 16 7.5 C 17 10.5, 17.5 13.5, 16 16 Z" />
      <path d="M16 14 C 15.2 12, 15.5 10, 16 8.5 C 16.5 10, 16.8 12, 16 14 Z" fill="currentColor" stroke="none" opacity="0.55" />
      <path d="M13.5 18.5 Q 16 17, 18.5 18.5" opacity="0.65" />
      <circle cx="11.5" cy="20.5" r="0.7" fill="currentColor" />
      <circle cx="20.5" cy="20.5" r="0.7" fill="currentColor" />
    </svg>
  );
}

/** Domed palace facade — heritage walks */
export function RoyalHeritageIcon({ strokeWidth = 1.15, ...props }: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={strokeWidth} {...props}>
      <path d="M4 24 L28 24" />
      <path d="M6 24 L6 17 L10 14 L10 24" />
      <path d="M22 24 L22 14 L26 17 L26 24" />
      <path d="M10 14 L16 9 L22 14" />
      <path d="M13.5 14 L13.5 11.5 C 14.5 10.5, 17.5 10.5, 18.5 11.5 L18.5 14" />
      <path d="M12 24 L12 18.5 L20 18.5 L20 24" />
      <path d="M14.5 21 L17.5 21" />
      <path d="M15.5 18.5 L15.5 16.5 M16.5 18.5 L16.5 16.5" />
      <circle cx="16" cy="8.5" r="1.1" />
      <path d="M14 8.5 L18 8.5" />
    </svg>
  );
}
