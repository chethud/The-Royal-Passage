import cartElephantUrl from "@/assets/icons/cart-elephant.png";

type CartIconProps = {
  /** Icon height in pixels; width scales with the artwork aspect ratio. */
  size?: number;
  className?: string;
};

export function CartIcon({ size = 18, className = "" }: CartIconProps) {
  return (
    <img
      src={cartElephantUrl}
      alt=""
      aria-hidden
      width={Math.round(size * 1.35)}
      height={size}
      className={`inline-block shrink-0 object-contain ${className}`}
      style={{ height: size, width: "auto", maxWidth: size * 1.6 }}
    />
  );
}
