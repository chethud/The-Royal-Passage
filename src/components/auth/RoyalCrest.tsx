export function RoyalCrest({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="32" cy="32" r="30" stroke="#D4AF37" strokeWidth="1.5" fill="#3B0000" fillOpacity="0.6" />
      <path
        d="M32 10 L38 26 L54 26 L42 36 L46 52 L32 42 L18 52 L22 36 L10 26 L26 26 Z"
        fill="#D4AF37"
        fillOpacity="0.85"
        stroke="#C9A227"
        strokeWidth="0.8"
      />
      <circle cx="32" cy="30" r="6" fill="#3B0000" stroke="#F8F4E8" strokeWidth="0.6" strokeOpacity="0.5" />
    </svg>
  );
}
