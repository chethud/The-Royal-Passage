import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Crown, Home } from "lucide-react";

const modules = [
  {
    id: "experiences",
    label: "Experiences",
    to: "/experiences",
    homeAnchor: "#experiences",
    icon: Compass,
    description: "Curated activities & workshops",
  },
  {
    id: "homestays",
    label: "Homestays",
    to: "/homestays",
    homeAnchor: "#homestays",
    icon: Home,
    description: "Stays, villas & guest houses",
  },
  {
    id: "vip",
    label: "VIP",
    to: "/vips",
    homeAnchor: "#vips",
    icon: Crown,
    description: "Palace suites & private villas",
  },
] as const;

type MarketplaceModuleNavProps = {
  /** On homepage, link experiences/homestays/vip to section anchors instead of routes. */
  variant?: "routes" | "home";
  className?: string;
};

export function MarketplaceModuleNav({ variant = "routes", className = "" }: MarketplaceModuleNavProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const onHome = pathname === "/";

  const isActive = (module: (typeof modules)[number]) => {
    if (module.id === "vip") {
      return pathname === "/vips" || pathname.startsWith("/vips/");
    }
    if (module.id === "homestays") {
      return pathname === "/homestays" || pathname.startsWith("/homestays/");
    }
    if (module.id === "experiences") {
      return (
        pathname === "/" ||
        pathname === "/experiences" ||
        pathname.startsWith("/experiences/")
      );
    }
    return false;
  };

  return (
    <nav
      aria-label="Marketplace modules"
      className={`marketplace-module-nav ${className}`}
    >
      <div className="marketplace-module-nav__inner">
        {modules.map((module) => {
          const active = isActive(module);
          const Icon = module.icon;
          const href = variant === "home" && onHome ? module.homeAnchor : module.to;

          const content = (
            <>
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="marketplace-module-nav__label">{module.label}</span>
              <span className="marketplace-module-nav__hint">{module.description}</span>
            </>
          );

          if (variant === "home" && onHome && href.startsWith("#")) {
            return (
              <a
                key={module.id}
                href={href}
                className={`marketplace-module-nav__item${active ? " marketplace-module-nav__item--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {content}
              </a>
            );
          }

          return (
            <Link
              key={module.id}
              to={module.to}
              className={`marketplace-module-nav__item${active ? " marketplace-module-nav__item--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
