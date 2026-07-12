import type { ComponentType, SVGProps } from "react";
import { ScrollReveal } from "@/components/site/ScrollReveal";
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
    <section className="border-t border-[oklch(0.88_0.08_86_/_0.12)] bg-[color-mix(in srgb, var(--brand-noir) 88%, var(--brand-maroon) 12%)] pt-5 pb-4 sm:pt-10 sm:pb-7 md:pt-12 md:pb-8">
      <div className="container-page px-2 sm:px-6">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-4 md:gap-6 lg:gap-8">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <ScrollReveal
                key={p.title}
                depth3d
                delay={idx * 0.07}
                offsetY={18}
                className={cn(
                  "relative flex min-w-0 flex-col items-center px-1 text-center sm:px-3 md:px-4",
                  // Vertical gradient line
                  "before:pointer-events-none before:absolute before:left-0 before:top-1/2 before:hidden before:h-[72%] before:w-px before:-translate-y-1/2 before:bg-gradient-to-b before:from-transparent before:via-ember/55 before:to-transparent",
                  // Centered diamond accent
                  "after:pointer-events-none after:absolute after:left-0 after:top-1/2 after:hidden after:h-1.5 after:w-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:border after:border-ember/55 after:bg-[color-mix(in srgb, var(--brand-noir) 88%, var(--brand-maroon) 12%)] after:shadow-[0_0_10px_oklch(0.78_0.13_86_/_0.45)]",
                  idx > 0 && "sm:before:block sm:after:block",
                )}
              >
                <span className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ember/55 bg-ember/8 text-ember shadow-[inset_0_1px_0_oklch(0.92_0.06_82_/_0.18)] sm:mb-5 sm:h-16 sm:w-16">
                  <Icon className="h-6 w-6 sm:h-9 sm:w-9" />
                </span>
                <div className="font-display text-[0.78rem] uppercase leading-tight tracking-[0.12em] text-ink sm:text-[0.95rem] sm:tracking-[0.2em]">
                  {p.title}
                </div>
                <p className="mt-1.5 max-w-[14rem] text-[0.72rem] leading-snug text-muted-foreground sm:mt-2 sm:max-w-[16rem] sm:text-[0.78rem] sm:leading-relaxed">
                  {p.description}
                </p>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
