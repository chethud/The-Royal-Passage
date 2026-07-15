import { Link, useRouterState } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";
import logoUrl from "@/assets/logo/logo.png";
import footerHeroImg from "@/assets/hero-image.png";
import { CONTACT_EMAIL } from "@/lib/seo";

const SOCIAL_LINKS = [
  { label: "Instagram", Icon: Instagram, href: "https://www.instagram.com/" },
  { label: "Facebook", Icon: Facebook, href: "https://www.facebook.com/" },
  { label: "YouTube", Icon: Youtube, href: "https://www.youtube.com/" },
] as const;

const MAPS_LINK = "https://maps.app.goo.gl/Qy3oqMKGpJDQUbeZ9";

const PAYMENT_POLICY_LINK = {
  label: "Payment Policy",
  to: "/legal/payment-policy" as const,
};

const PRIVACY_POLICY_LINK = {
  label: "Privacy Policy",
  to: "/legal/privacy-policy" as const,
};

const EXPERIENCE_TERMS_LINK = {
  label: "Terms & Conditions",
  to: "/legal/experience-terms" as const,
};

const quickLinks = [
  { label: "Experiences", to: "/experiences" },
  { label: "Homestays", to: "/homestays" },
  { label: "Journal", to: "/journal" },
];

const experiences = ["Pottery Experience", "Outdoor Cooking", "Heritage Walks"];

export function Footer() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isHomepage = pathname === "/";

  if (!isHomepage) {
    return <FooterSimple />;
  }

  return <FooterFull />;
}

function FooterBrandBlock({
  logoClassName = "h-28 w-auto object-contain sm:h-32 md:h-40",
}: {
  logoClassName?: string;
}) {
  return (
    <div className="flex shrink-0 items-start justify-center sm:justify-start">
      <img
        src={logoUrl}
        alt="The Royal Passage"
        width={320}
        height={110}
        loading="lazy"
        decoding="async"
        className={`logo-breathe object-contain ${logoClassName}`}
      />
    </div>
  );
}

function FooterCopyright() {
  return (
    <p
      className="whitespace-nowrap text-right text-[0.58rem] leading-snug text-muted-foreground/75 sm:text-[0.65rem]"
      suppressHydrationWarning
    >
      © {new Date().getFullYear()} The Royal Passage. All rights reserved.
    </p>
  );
}

function FooterSocialIcons({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex shrink-0 flex-row flex-nowrap items-center justify-end gap-1.5 sm:gap-2">
      {SOCIAL_LINKS.map(({ label, Icon, href }) => (
        <SocialIcon key={label} label={label} Icon={Icon} href={href} compact={compact} />
      ))}
    </div>
  );
}

/** Logo left · legal links truly centered · social icons with copyright below on the right. */
function FooterBar({
  logoClassName = "h-12 w-auto object-contain sm:h-14 md:h-16",
  showLogo = true,
}: {
  logoClassName?: string;
  showLogo?: boolean;
}) {
  return (
    <div className="container-page relative flex flex-row flex-nowrap items-center justify-between gap-2 py-3 sm:gap-4 sm:py-4">
      {showLogo ? (
        <div className="relative z-10 shrink-0">
          <img
            src={logoUrl}
            alt="The Royal Passage"
            width={320}
            height={110}
            loading="lazy"
            decoding="async"
            className={`logo-breathe ${logoClassName}`}
          />
        </div>
      ) : (
        <div className="relative z-10 w-0 shrink-0 sm:w-16" aria-hidden />
      )}

      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-0 flex -translate-y-1/2 justify-center px-2">
        <div className="pointer-events-auto max-w-[min(100%,28rem)] overflow-hidden">
          <FooterLegalLinks className="justify-center whitespace-nowrap" />
        </div>
      </div>

      <div className="relative z-10 ml-auto flex shrink-0 flex-col items-end gap-1 sm:gap-1.5">
        <FooterSocialIcons compact />
        <FooterCopyright />
      </div>
    </div>
  );
}

function FooterSimple() {
  return (
    <footer className="border-t border-[oklch(0.88_0.08_86_/_0.18)] bg-[oklch(0.13_0.06_22)]">
      <FooterBar />
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
        <div className="flex flex-col items-start gap-8 lg:flex-row lg:flex-nowrap lg:items-start lg:justify-between lg:gap-4 xl:gap-6">
          <div className="w-full shrink-0 lg:w-auto lg:max-w-[14rem] xl:max-w-[18rem]">
            <FooterBrandBlock logoClassName="h-28 w-auto max-w-full sm:h-32 lg:h-40 xl:h-44" />
          </div>

          <section className="min-w-0 w-full lg:w-auto lg:flex-1 lg:basis-0">
            <div className="flex flex-col items-start gap-6 sm:gap-7">
              <div>
                <h2 className="eyebrow mb-3 text-ember/95">Experience Host</h2>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      to="/partner/experience-host"
                      className="text-muted-foreground transition-colors hover:text-ember"
                    >
                      Partner with us
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="eyebrow mb-3 text-ember/95">Homestay Host</h2>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      to="/partner/homestay-host"
                      className="text-muted-foreground transition-colors hover:text-ember"
                    >
                      List your property
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <FooterColumn title="Quick Links" className="min-w-0 w-full lg:w-auto lg:flex-1 lg:basis-0">
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

          <FooterColumn title="Experiences" className="min-w-0 w-full lg:w-auto lg:flex-1 lg:basis-0">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {experiences.map((e) => (
                <li key={e} className="transition-colors hover:text-ember">
                  {e}
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Get in Touch" className="min-w-0 w-full lg:w-auto lg:flex-1 lg:basis-0">
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
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="transition-colors hover:text-ember"
                >
                  {CONTACT_EMAIL}
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

      <div className="relative z-10 border-t border-[oklch(0.88_0.08_86_/_0.12)]">
        <FooterBar showLogo={false} />
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
    <div
      className={`flex flex-nowrap items-center gap-x-2 overflow-hidden text-[0.62rem] sm:gap-x-3 sm:text-xs ${className}`}
    >
      <Link
        to={EXPERIENCE_TERMS_LINK.to}
        className="text-ember/85 underline-offset-4 transition-colors hover:text-ember hover:underline"
      >
        {EXPERIENCE_TERMS_LINK.label}
      </Link>
      <span className="text-muted-foreground/50" aria-hidden>
        ·
      </span>
      <Link
        to={PAYMENT_POLICY_LINK.to}
        className="text-ember/85 underline-offset-4 transition-colors hover:text-ember hover:underline"
      >
        {PAYMENT_POLICY_LINK.label}
      </Link>
      <span className="text-muted-foreground/50" aria-hidden>
        ·
      </span>
      <Link
        to={PRIVACY_POLICY_LINK.to}
        className="text-ember/85 underline-offset-4 transition-colors hover:text-ember hover:underline"
      >
        {PRIVACY_POLICY_LINK.label}
      </Link>
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
