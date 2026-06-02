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

export function CrownIcon({ strokeWidth = 1.3, ...props }: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={strokeWidth} {...props}>
      <path d="M4.5 22 L6.5 11 L12 16.5 L14 7 L16 18.5 L18 7 L20 16.5 L25.5 11 L27.5 22 Z" />
      <path d="M5 22 L5 25.5 L27 25.5 L27 22" />
      <path d="M9 25.5 L9 22 M16 25.5 L16 22 M23 25.5 L23 22" />
      <circle cx="14" cy="6" r="0.9" fill="currentColor" />
      <circle cx="18" cy="6" r="0.9" fill="currentColor" />
      <circle cx="6.5" cy="10" r="0.7" fill="currentColor" />
      <circle cx="25.5" cy="10" r="0.7" fill="currentColor" />
      <circle cx="16" cy="18.5" r="1" />
    </svg>
  );
}

export function LotusBudIcon({ strokeWidth = 1.3, ...props }: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={strokeWidth} {...props}>
      <path d="M16 6 C 12 12, 12 18, 16 23 C 20 18, 20 12, 16 6 Z" />
      <path d="M16 11 L16 22" />
      <path d="M16 23 C 11 23, 7 25, 5.5 27.5" />
      <path d="M16 23 C 21 23, 25 25, 26.5 27.5" />
      <path d="M8 23 C 8 21, 9.5 19.5, 11.5 19.5" />
      <path d="M24 23 C 24 21, 22.5 19.5, 20.5 19.5" />
      <circle cx="16" cy="14.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function LotusIcon({ strokeWidth = 1.3, ...props }: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={strokeWidth} {...props}>
      <path d="M16 5 C 13.5 11, 13.5 17, 16 22 C 18.5 17, 18.5 11, 16 5 Z" />
      <path d="M16 22 C 12 21, 9 16, 9.5 11.5 C 13 12, 15 16, 16 22 Z" />
      <path d="M16 22 C 20 21, 23 16, 22.5 11.5 C 19 12, 17 16, 16 22 Z" />
      <path d="M16 22 C 11 22, 6 19, 4.5 14.5 C 8.5 14.5, 13 17, 16 22 Z" />
      <path d="M16 22 C 21 22, 26 19, 27.5 14.5 C 23.5 14.5, 19 17, 16 22 Z" />
      <path d="M3 24 Q 7 22, 11 24 T 19 24 T 29 24" />
    </svg>
  );
}

export function ClocheIcon({ strokeWidth = 1.3, ...props }: IconProps) {
  return (
    <svg {...baseProps} strokeWidth={strokeWidth} {...props}>
      <path d="M5 22 C 5 13, 10 8, 16 8 C 22 8, 27 13, 27 22 Z" />
      <line x1="3" y1="22" x2="29" y2="22" />
      <line x1="4.5" y1="25.5" x2="27.5" y2="25.5" />
      <line x1="16" y1="8" x2="16" y2="5.5" />
      <circle cx="16" cy="4.5" r="1.3" fill="currentColor" />
      <path d="M10 15 Q 16 12, 22 15" opacity="0.6" />
    </svg>
  );
}
