import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SheetClose } from "@/components/ui/sheet";

export const headerMobileTriggerClass =
  "header-mobile-trigger header-nav-link inline-flex text-ink/85 md:hidden";

export const headerMobileActionClass =
  "header-mobile-action header-nav-link inline-flex text-ink/85 md:hidden";

export const headerMobileSheetClass =
  "header-mobile-sheet w-[min(100vw-1rem,22rem)] border-[color:rgba(198,161,91,0.22)] bg-[color:var(--royal-plum)] text-foreground sm:max-w-sm [&>button]:right-3 [&>button]:top-3 [&>button]:inline-flex [&>button]:h-11 [&>button]:w-11 [&>button]:items-center [&>button]:justify-center";

export const headerMobileNavLinkClass = "header-mobile-nav-link";

export function MobileNavDivider() {
  return <div className="header-mobile-nav-divider" role="separator" />;
}

export function MobileNavSectionLabel({ children }: { children: ReactNode }) {
  return <p className="header-mobile-nav-section-label">{children}</p>;
}

type MobileNavLinkProps = {
  to?: string;
  params?: Record<string, string>;
  active?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  closeOnNavigate?: boolean;
};

export function MobileNavLink({
  to,
  params,
  active = false,
  children,
  className = "",
  onClick,
  disabled = false,
  closeOnNavigate = true,
}: MobileNavLinkProps) {
  const linkClass = `${headerMobileNavLinkClass}${active ? " header-mobile-nav-link--active" : ""} ${className}`.trim();

  if (onClick || !to) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`${linkClass} w-full text-left disabled:opacity-70`}
      >
        {children}
      </button>
    );
  }

  const link = (
    <Link to={to as "/experiences"} params={params} className={linkClass}>
      {children}
    </Link>
  );

  if (!closeOnNavigate) return link;

  return <SheetClose asChild>{link}</SheetClose>;
}
