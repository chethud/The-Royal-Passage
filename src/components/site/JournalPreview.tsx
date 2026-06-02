import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import heroPalaceImg from "@/assets/hero-image.png";
import masalaDoseImg from "@/assets/masala-dose.png";
import natureWalksImg from "@/assets/nature-walks.png";

type Story = {
  image: string;
  alt: string;
  title: string;
  excerpt: string;
};

const stories: Story[] = [
  {
    image: heroPalaceImg,
    alt: "Mysuru Palace illuminated at sunset",
    title: "A Walk Through Time",
    excerpt: "Heritage walks in Mysuru are like stepping into a royal era.",
  },
  {
    image: masalaDoseImg,
    alt: "A crisp masala dose served with chutneys — Mysuru's iconic breakfast",
    title: "Flavours of Mysuru",
    excerpt: "Explore the culinary legacy of the Wadiyars.",
  },
  {
    image: natureWalksImg,
    alt: "A nature trail winding through the green hills near Mysuru",
    title: "Nature's Escape",
    excerpt: "Unwind in the serene trails around Mysuru.",
  },
];

export function JournalPreview() {
  return (
    <section className="bg-background py-16 sm:py-20 md:py-24">
      <div className="container-page">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <div className="eyebrow mb-3 text-ember/95">Stories & Inspiration</div>
            <h2 className="font-display text-3xl tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
              From our Journal
            </h2>
          </div>
          <Link
            to="/journal"
            className="group inline-flex items-center gap-2 self-start rounded-sm text-xs font-semibold uppercase tracking-[0.22em] text-ember transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:self-auto"
          >
            View all stories
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 md:gap-7">
          {stories.map((s, idx) => (
            <motion.article
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className="group overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.18)] shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-ember/55 hover:shadow-[0_28px_60px_-30px_oklch(0.55_0.14_78_/_0.45)]"
            >
              <Link
                to="/journal"
                className="relative block aspect-[5/4] overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:aspect-[4/5] md:aspect-[5/6]"
              >
                <img
                  src={s.image}
                  alt={s.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                {/* Two-stop gradient — strong at the bottom for text readability, fades to clear at the top */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/92 via-black/55 to-transparent"
                />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-lg uppercase tracking-[0.16em] text-ember drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
                    {s.excerpt}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink transition-colors group-hover:text-ember">
                    Read more
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
