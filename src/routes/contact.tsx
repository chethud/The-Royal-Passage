import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { buildContactJsonLd, SITE_URL } from "@/lib/seo";

const MAPS_LINK = "https://maps.app.goo.gl/Qy3oqMKGpJDQUbeZ9";
const MAPS_EMBED =
  "https://maps.google.com/maps?q=5th+Cross+Road,+Saraswathipuram,+Mysuru,+Karnataka+570009&hl=en&z=16&output=embed";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — The Royal Passage" },
      {
        name: "description",
        content:
          "Reach The Royal Passage in Saraswathipuram, Mysuru. Call, message on WhatsApp, email, or find us on the map.",
      },
      { property: "og:title", content: "Contact — The Royal Passage" },
      {
        property: "og:description",
        content: "Call, WhatsApp, email, or visit The Royal Passage in Saraswathipuram, Mysuru.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/contact` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
  }),
  component: ContactPage,
});

type Method = {
  icon: typeof Phone;
  label: string;
  value: string;
  href: string;
  external?: boolean;
};

const methods: Method[] = [
  {
    icon: Phone,
    label: "Call us",
    value: "+91 729588826",
    href: "tel:+91729588826",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Chat with us",
    href: "https://wa.me/91729588826",
    external: true,
  },
  {
    icon: Mail,
    label: "Email",
    value: "prajwalbp500@gmail.com",
    href: "mailto:prajwalbp500@gmail.com",
  },
  {
    icon: MapPin,
    label: "Visit us",
    value: "5th Cross Road, Saraswathipuram, Mysuru, Karnataka 570009",
    href: MAPS_LINK,
    external: true,
  },
];

function ContactPage() {
  const ldJson = buildContactJsonLd();

  return (
    <div className="pt-[var(--header-height)] text-foreground">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />

      <section className="container-page py-12 sm:py-16 md:py-20">
        <div className="max-w-2xl">
          <div className="eyebrow mb-3 text-ember/95">Get in touch</div>
          <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-ink text-balance sm:text-5xl md:text-6xl">
            Plan your royal passage.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base">
            Tell us what you have in mind — a heritage walk, a private dinner, a multi-day curation
            — and we will design it around you. Reach us on the channel that suits you best.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {methods.map((m) => {
              const Icon = m.icon;
              return (
                <li key={m.label}>
                  <a
                    href={m.href}
                    {...(m.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="group flex h-full items-start gap-4 rounded-md border border-[oklch(0.88_0.08_86_/_0.18)] bg-[oklch(0.18_0.07_22_/_0.6)] p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-ember/55 hover:shadow-[0_24px_50px_-28px_oklch(0.55_0.14_78_/_0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ember/45 bg-ember/10 text-ember">
                      <Icon className="h-4 w-4" strokeWidth={1.6} />
                    </span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-ember/90">
                        {m.label}
                      </span>
                      <span className="break-words text-sm text-ink/90 transition-colors group-hover:text-ember">
                        {m.value}
                      </span>
                    </span>
                    {m.external ? (
                      <ExternalLink className="ml-auto mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-ember" />
                    ) : null}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.18)] bg-[color-mix(in srgb, var(--brand-noir) 88%, var(--brand-maroon) 12%)] shadow-soft">
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[420px]">
              <iframe
                title="The Royal Passage — Saraswathipuram, Mysuru"
                src={MAPS_EMBED}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0 grayscale-[15%] contrast-[1.05] saturate-[0.9]"
                allowFullScreen
              />
            </div>
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between border-t border-[oklch(0.88_0.08_86_/_0.16)] bg-[oklch(0.14_0.06_22)] px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ember/10 hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ember/60"
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-ember/80" />
                Open in Google Maps
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-ember/80" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
