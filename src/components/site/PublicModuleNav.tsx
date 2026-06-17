import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Home } from "lucide-react";
import {
  isHomestayPublicSection,
  resolvePublicSiteModule,
  type PublicSiteModule,
} from "@/lib/public-site-nav";

const modules: {
  id: PublicSiteModule;
  label: string;
  description: string;
  to: string;
  icon: typeof Compass;
}[] = [
  {
    id: "experiences",
    label: "Experiences",
    description: "Activities, walks & workshops",
    to: "/",
    icon: Compass,
  },
  {
    id: "homestays",
    label: "Homestays",
    description: "Stays, villas & guest houses",
    to: "/homestays",
    icon: Home,
  },
];

type PublicModuleNavProps = {
  className?: string;
};

/** Switch between Experiences and Homestays on the two public homepages. */
export function PublicModuleNav({ className = "" }: PublicModuleNavProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const activeModule = resolvePublicSiteModule(pathname);

  if (!isHomestayPublicSection(pathname) && pathname !== "/") {
    return null;
  }

  return (
    <nav aria-label="Site modules" className={`marketplace-module-nav ${className}`}>
      <div className="marketplace-module-nav__inner">
        {modules.map((module) => {
          const active = activeModule === module.id;
          const Icon = module.icon;

          return (
            <Link
              key={module.id}
              to={module.to}
              className={`marketplace-module-nav__item${active ? " marketplace-module-nav__item--active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="marketplace-module-nav__label">{module.label}</span>
              <span className="marketplace-module-nav__hint">{module.description}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
