import { Link, useRouterState } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";
import logoUrl from "@/assets/logo/logo.png";
import footerHeroImg from "@/assets/hero-image.png";

const TAGLINE =
  "The Royal Passage is an experience-led travel company curating immersive journeys in and around Mysuru.";

const SOCIAL_LINKS = [
  { label: "Instagram", Icon: Instagram, href: "https://www.instagram.com/" },
  { label: "Facebook", Icon: Facebook, href: "https://www.facebook.com/" },
  { label: "YouTube", Icon: Youtube, href: "https://www.youtube.com/" },
] as const;

const MAPS_LINK = "https://maps.app.goo.gl/Qy3oqMKGpJDQUbeZ9";

const EXPERIENCE_TERMS_LINK = {
  label: "Terms of Service",
  to: "/legal/experience-terms" as const,
};

const quickLinks = [
  { label: "Experiences", to: "/experiences" },
  { label: "Homestays", to: "/homestays" },
  { label: "Journal", to: "/journal" },
  { label: "Contact", to: "/contact" },
  { label: "Terms of Service", to: EXPERIENCE_TERMS_LINK.to },
];

const experiences = ["Pottery Experience", "Outdoor Cooking", "Heritage Walks"];

export function Footer() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isHomepage = pathname === "/";
  const isExperiencesPage = pathname === "/experiences" || pathname.startsWith("/experiences/");

  if (!isHomepage) {
    return <FooterSimple showLegalLinks={isExperiencesPage} />;
  }

  return <FooterFull />;
}

function FooterBrandBlock({
  logoClassName = "h-28 w-auto object-contain sm:h-32 md:h-40",
  layout = "inline",
}: {
  logoClassName?: string;
  layout?: "inline" | "row";
}) {
  if (layout === "row") {
    return (
      <div className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center sm:justify-start sm:text-left sm:gap-x-4">
        <img
          src={logoUrl}
          alt="The Royal Passage"
          width={320}
          height={110}
          loading="lazy"
          decoding="async"
          className={`logo-breathe shrink-0 ${logoClassName}`}
        />
        <p className="max-w-[18rem] text-xs leading-snug text-muted-foreground sm:max-w-xs sm:text-sm md:max-w-sm lg:max-w-md">
          {TAGLINE}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {SOCIAL_LINKS.map(({ label, Icon, href }) => (
            <SocialIcon key={label} label={label} Icon={Icon} href={href} compact />
          ))}
        </div>
        <p
          className="w-full shrink-0 text-center text-[0.65rem] text-muted-foreground/75 sm:w-auto sm:text-[0.68rem]"
          suppressHydrationWarning
        >
          © {new Date().getFullYear()} The Royal Passage. All rights reserved.
        </p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center text-center sm:items-start sm:text-left">
      <img
        src={logoUrl}
        alt="The Royal Passage"
        width={320}
        height={110}
        loading="lazy"
        decoding="async"
        className={`logo-breathe object-contain ${logoClassName} sm:origin-left sm:-translate-x-1.5 sm:object-left`}
      />
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{TAGLINE}</p>
      <div className="mt-3 flex items-center justify-center gap-2.5 sm:justify-start">
        {SOCIAL_LINKS.map(({ label, Icon, href }) => (
          <SocialIcon key={label} label={label} Icon={Icon} href={href} />
        ))}
      </div>
    </div>
  );
}

function FooterSimple({ showLegalLinks = false }: { showLegalLinks?: boolean }) {
  return (
    <footer className="border-t border-[oklch(0.88_0.08_86_/_0.18)] bg-[oklch(0.13_0.06_22)]">
      <div className="container-page py-2.5 sm:py-5">
        <FooterBrandBlock layout="row" logoClassName="h-14 w-auto object-contain sm:h-14 md:h-16" />
        {showLegalLinks ? <FooterLegalLinks className="mt-3 justify-center sm:justify-start" /> : null}
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="eyebrow mb-3 text-ember/95">{title}</h2>
      {children}
    </section>
  );
}

function FooterFull() {
  return (
    <footer className="relative overflow-hidden border-t border-[oklch(0.88_0.08_86_/_0.18)] bg-[oklch(0.13_0.06_22)]">
      <div className="container-page relative z-10 py-7 sm:py-12 lg:py-14">
        <div className="flex flex-col gap-6 sm:gap-10 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
          <div className="w-full shrink-0 lg:w-[15rem] xl:w-[16rem]">
            <FooterBrandBlock logoClassName="h-14 w-auto sm:h-16" />
          </div>

          <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-6 sm:gap-x-10 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8 xl:gap-x-10">
            <FooterColumn title="Quick Links">
              <ul className="space-y-2 text-sm">
                {quickLinks.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to as "/experiences"}
                      className="text-muted-foreground transition-colors hover:text-ember"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterColumn>

            <FooterColumn title="Experiences">
              <ul className="space-y-2 text-sm text-muted-foreground">
                {experiences.map((e) => (
                  <li key={e} className="transition-colors hover:text-ember">
                    {e}
                  </li>
                ))}
              </ul>
            </FooterColumn>

            <FooterColumn title="Get in Touch" className="col-span-2 lg:col-span-1">
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-ember/80" />
                  <a href="tel:+91729588826" className="transition-colors hover:text-ember">
                    +91 729588826
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-ember/80" />
                  <a
                    href="https://wa.me/91729588826"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-ember"
                  >
                    WhatsApp: +91 729588826
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-ember/80" />
                  <a
                    href="mailto:prajwalbp500@gmail.com"
                    className="transition-colors hover:text-ember"
                  >
                    prajwalbp500@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember/80" />
                  <a
                    href={MAPS_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="leading-snug transition-colors hover:text-ember"
                  >
                    5th Cross Road, Saraswathipuram, Mysuru, Karnataka 570009
                  </a>
                </li>
              </ul>
            </FooterColumn>
          </div>
        </div>
      </div>

      <div className="container-page relative z-10 flex flex-wrap items-center justify-center gap-1.5 border-t border-[oklch(0.88_0.08_86_/_0.12)] py-3 text-[0.68rem] text-muted-foreground text-center sm:justify-between sm:gap-3 sm:py-6 sm:text-xs sm:text-left">
        <span suppressHydrationWarning>© {new Date().getFullYear()} The Royal Passage. All rights reserved.</span>
        <FooterLegalLinks className="w-full justify-center sm:w-auto" />
      </div>

      <img
        src={footerHeroImg}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[62%] select-none object-cover object-[center_35%] opacity-[0.22] saturate-[0.85] lg:block [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_42%,black_100%)] [mask-image:linear-gradient(to_right,transparent_0%,black_42%,black_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_right,oklch(0.13_0.06_22)_0%,oklch(0.13_0.06_22_/_0.94)_28%,oklch(0.13_0.06_22_/_0.78)_52%,oklch(0.13_0.06_22_/_0.5)_78%,oklch(0.13_0.06_22_/_0.28)_100%)] lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_bottom,oklch(0.13_0.06_22)_0%,transparent_18%,transparent_82%,oklch(0.13_0.06_22)_100%)] lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[35%] bg-[radial-gradient(ellipse_at_right,oklch(0.55_0.14_78_/_0.05)_0%,transparent_70%)] lg:block"
      />
    </footer>
  );
}

function FooterLegalLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.68rem] sm:text-xs ${className}`}>
      <Link
        to={EXPERIENCE_TERMS_LINK.to}
        className="text-ember/85 underline-offset-4 transition-colors hover:text-ember hover:underline"
      >
        {EXPERIENCE_TERMS_LINK.label}
      </Link>
      <span className="hidden text-muted-foreground/50 sm:inline" aria-hidden>
        ·
      </span>
      <span className="text-ember/70">Crafted with intention.</span>
    </div>
  );
}

function SocialIcon({
  label,
  Icon,
  href,
  compact = false,
}: {
  label: string;
  Icon: typeof Instagram;
  href: string;
  compact?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className={`flex items-center justify-center rounded-full border border-[oklch(0.88_0.08_86_/_0.32)] text-ink/80 transition-all hover:border-ember/60 hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        compact ? "h-8 w-8" : "h-9 w-9"
      }`}
    >
      <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={1.6} />
    </a>
  );
}
