import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import expCraftImg from "@/assets/exp-craft.jpg";
import heroPalaceImg from "@/assets/hero-image.png";
import outdoorCookingImg from "@/assets/outdoor-cooking.png";
import {
  RoyalFlameIcon,
  RoyalHeritageIcon,
  RoyalPotteryIcon,
} from "@/components/site/ExperienceShowcaseIcons";
import type { ComponentType, SVGProps } from "react";

type ShowcaseIcon = ComponentType<SVGProps<SVGSVGElement>>;

type ShowcaseCard = {
  icon: ShowcaseIcon;
  title: string;
  image: string;
  alt: string;
  href: string;
};

const cards: ShowcaseCard[] = [
  {
    icon: RoyalPotteryIcon,
    title: "Pottery Experience",
    image: expCraftImg,
    alt: "Hands shaping clay on a pottery wheel",
    href: "/experiences?category=Craft",
  },
  {
    icon: RoyalFlameIcon,
    title: "Outdoor Cooking",
    image: outdoorCookingImg,
    alt: "Open fire cooking in the wild under warm light",
    href: "/experiences?category=Tasting",
  },
  {
    icon: RoyalHeritageIcon,
    title: "Heritage Walks",
    image: heroPalaceImg,
    alt: "Mysuru palace at golden hour",
    href: "/experiences",
  },
];

export function ExperiencesShowcase() {
  return (
    <section className="relative border-y border-[oklch(0.88_0.08_86_/_0.1)] bg-[oklch(0.16_0.07_22)] py-16 sm:py-20 md:py-24">
      <div className="container-page">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <h2 className="font-display text-3xl tracking-tight text-ink text-balance sm:text-4xl md:text-5xl">
            Our Top 3 Experiences
          </h2>
          <Link
            to="/experiences"
            className="group inline-flex items-center gap-2 self-start rounded-sm text-xs font-semibold uppercase tracking-[0.22em] text-ember transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:self-auto"
          >
            View all experiences
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 md:gap-7">
          {cards.map((card, idx) => (
            <ExperienceShowcaseCard key={card.title} card={card} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ExperienceShowcaseCard({ card, index }: { card: ShowcaseCard; index: number }) {
  const Icon = card.icon;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group overflow-hidden rounded-md border border-[oklch(0.88_0.08_86_/_0.18)] shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-ember/55 hover:shadow-[0_28px_60px_-30px_oklch(0.55_0.14_78_/_0.45)]"
    >
      <Link
        to={card.href as "/experiences"}
        className="relative block aspect-[5/4] overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:aspect-[4/5] md:aspect-[5/6]"
      >
        <img
          src={card.image}
          alt={card.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/92 via-black/55 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent"
        />
        <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[oklch(0.78_0.1_78_/_0.55)] bg-[oklch(0.14_0.05_22_/_0.72)] text-ember shadow-[inset_0_1px_0_oklch(0.9_0.06_82_/_0.2),0_0_18px_oklch(0.7_0.12_78_/_0.25)] backdrop-blur-md">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h3 className="font-display text-lg uppercase tracking-[0.16em] text-ember drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
            {card.title}
          </h3>
        </div>
      </Link>
    </motion.article>
  );
}
