import { Link, useRouterState } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";
import logoUrl from "@/assets/logo/logo.png";
import footerPalaceImg from "@/assets/footer-palace.png";

const TAGLINE =
  "The Royal Passage is an experience-led travel company curating immersive journeys in and around Mysuru.";

const SOCIAL_LINKS = [
  { label: "Instagram", Icon: Instagram, href: "https://www.instagram.com/" },
  { label: "Facebook", Icon: Facebook, href: "https://www.facebook.com/" },
  { label: "YouTube", Icon: Youtube, href: "https://www.youtube.com/" },
] as const;

const quickLinks = [
  { label: "Experiences", to: "/experiences" },
  { label: "Homestays", to: "/homestays" },
  { label: "Curated Journeys", to: "/experiences" },
  { label: "About Us", to: "/hosts" },
  { label: "Gallery", to: "/experiences" },
  { label: "Journal", to: "/journal" },
  { label: "Contact", to: "/contact" },
];

const MAPS_LINK = "https://maps.app.goo.gl/Qy3oqMKGpJDQUbeZ9";
const MAPS_EMBED =
  "https://maps.google.com/maps?q=5th+Cross+Road,+Saraswathipuram,+Mysuru,+Karnataka+570009&hl=en&z=15&output=embed";

const experiences = ["Pottery Experience", "Outdoor Cooking", "Heritage Walks"];

export function Footer() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isHomepage = pathname === "/";

  if (!isHomepage) {
    return <FooterSimple />;
  }

  return <FooterFull />;
}

function FooterBrandBlock({ logoClassName = "h-28 w-auto object-contain sm:h-32 md:h-40" }: { logoClassName?: string }) {
  return (
    <>
      <img
        src={logoUrl}
        alt="The Royal Passage"
        width={320}
        height={110}
        loading="lazy"
        decoding="async"
        className={`logo-breathe ${logoClassName}`}
      />
      <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">{TAGLINE}</p>
      <div className="mt-6 flex items-center gap-3">
        {SOCIAL_LINKS.map(({ label, Icon, href }) => (
          <SocialIcon key={label} label={label} Icon={Icon} href={href} />
        ))}
      </div>
    </>
  );
}

function FooterSimple() {
  return (
    <footer className="mt-16 border-t border-gold/20 bg-brand-noir">
      <div className="container-page py-10 sm:py-12">
        <FooterBrandBlock logoClassName="h-24 w-auto object-contain sm:h-28" />
      </div>

      <div className="container-page border-t border-gold/15 py-5 text-xs text-muted-foreground">
        <span suppressHydrationWarning>© {new Date().getFullYear()} The Royal Passage. All rights reserved.</span>
      </div>
    </footer>
  );
}

function FooterFull() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-gold/20 bg-brand-noir">
      <div className="container-page relative z-10 grid gap-10 py-12 sm:grid-cols-2 sm:py-14 md:grid-cols-[1.5fr_1fr_1fr_1.2fr] md:gap-12 md:py-16">
        <div>
          <FooterBrandBlock />
        </div>

        <div>
          <div className="eyebrow mb-4 text-ember/95">Quick Links</div>
          <ul className="space-y-2.5 text-sm">
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
        </div>

        <div>
          <div className="eyebrow mb-4 text-ember/95">Experiences</div>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {experiences.map((e) => (
              <li key={e} className="transition-colors hover:text-ember">
                {e}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-4 text-ember/95">Get in Touch</div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-ember/80" />
              <a href="tel:+91729588826" className="transition-colors hover:text-ember">
                +91 729588826
              </a>
            </li>
            <li className="flex items-start gap-3">
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
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-ember/80" />
              <a
                href="mailto:prajwalbp500@gmail.com"
                className="transition-colors hover:text-ember"
              >
                prajwalbp500@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember/80" />
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-ember"
              >
                5th Cross Road, Saraswathipuram, Mysuru, Karnataka 570009
              </a>
            </li>
          </ul>

          <a
            href={MAPS_LINK}
            target="_blank"
            rel="noreferrer"
            aria-label="Open The Royal Passage location in Google Maps"
            className="group mt-5 block overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.18)] shadow-soft transition-all hover:border-ember/55 hover:shadow-[0_18px_40px_-24px_oklch(0.55_0.14_78_/_0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="relative aspect-[16/10] w-full">
              <iframe
                title="The Royal Passage — Saraswathipuram, Mysuru"
                src={MAPS_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0 grayscale-[15%] contrast-[1.05] saturate-[0.9]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[oklch(0.88_0.08_86_/_0.1)] transition-colors group-hover:ring-ember/30"
              />
            </div>
          </a>
        </div>
      </div>

      <div className="container-page relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-[oklch(0.88_0.08_86_/_0.12)] py-6 text-xs text-muted-foreground">
        <span suppressHydrationWarning>© {new Date().getFullYear()} The Royal Passage. All rights reserved.</span>
        <span className="text-ember/70">Crafted with intention.</span>
      </div>

      <img
        src={footerPalaceImg}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[58%] select-none object-cover object-right opacity-[0.14] mix-blend-screen [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_50%,black_100%)] [mask-image:linear-gradient(to_right,transparent_0%,black_50%,black_100%)] lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_right,var(--brand-noir)_0%,oklch(0.13_0.06_22_/_0.92)_30%,oklch(0.13_0.06_22_/_0.7)_55%,oklch(0.13_0.06_22_/_0.45)_80%,oklch(0.13_0.06_22_/_0.25)_100%)] lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_bottom,var(--brand-noir)_0%,transparent_18%,transparent_82%,var(--brand-noir)_100%)] lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[35%] bg-[radial-gradient(ellipse_at_right,oklch(0.55_0.14_78_/_0.05)_0%,transparent_70%)] lg:block"
      />
    </footer>
  );
}

function SocialIcon({
  label,
  Icon,
  href,
}: {
  label: string;
  Icon: typeof Instagram;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[oklch(0.88_0.08_86_/_0.32)] text-ink/80 transition-all hover:border-ember/60 hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Icon className="h-4 w-4" strokeWidth={1.6} />
    </a>
  );
}
