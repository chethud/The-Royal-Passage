import type { ComponentType, SVGProps } from "react";
import { motion } from "motion/react";
import { ClocheIcon, CrownIcon, LotusBudIcon, LotusIcon } from "@/components/site/PillarIcons";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type Pillar = {
  icon: IconComponent;
  title: string;
  description: string;
};

const pillars: Pillar[] = [
  {
    icon: CrownIcon,
    title: "Royal Heritage",
    description: "Experience the grandeur and traditions of Mysuru's royal past.",
  },
  {
    icon: LotusBudIcon,
    title: "Authentic & Local",
    description: "Handpicked local experts and immersive interactions.",
  },
  {
    icon: LotusIcon,
    title: "Sustainable Tourism",
    description: "Responsible travel that respects nature and culture.",
  },
  {
    icon: ClocheIcon,
    title: "Bespoke Service",
    description: "Thoughtfully curated, just for you.",
  },
];

export function PillarsRow() {
  return (
    <section className="border-t border-[oklch(0.88_0.08_86_/_0.12)] bg-[oklch(0.16_0.07_22)] py-12 sm:py-14 md:py-16">
      <div className="container-page">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-6 lg:gap-8">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6, delay: idx * 0.07 }}
                className={cn(
                  "relative flex flex-col items-center px-4 text-center",
                  // Vertical gradient line
                  "before:pointer-events-none before:absolute before:left-0 before:top-1/2 before:hidden before:h-[72%] before:w-px before:-translate-y-1/2 before:bg-gradient-to-b before:from-transparent before:via-ember/55 before:to-transparent",
                  // Centered diamond accent
                  "after:pointer-events-none after:absolute after:left-0 after:top-1/2 after:hidden after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:border after:border-ember/55 after:bg-[oklch(0.16_0.07_22)] after:shadow-[0_0_10px_oklch(0.78_0.13_86_/_0.45)]",
                  idx % 2 === 1 && "sm:before:block sm:after:block",
                  idx > 0 && "md:before:block md:after:block",
                )}
              >
                <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-ember/55 bg-ember/8 text-ember shadow-[inset_0_1px_0_oklch(0.92_0.06_82_/_0.18)]">
                  <Icon className="h-9 w-9" />
                </span>
                <div className="font-display text-[0.95rem] uppercase tracking-[0.2em] text-ink">
                  {p.title}
                </div>
                <p className="mt-2 max-w-[16rem] text-xs leading-relaxed text-muted-foreground sm:text-[0.78rem]">
                  {p.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
