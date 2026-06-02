import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { MouseEvent } from "react";
import type { Experience } from "@/data/experiences";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { formatDateShort } from "@/lib/date-format";

export function ExperienceCard({ exp }: { exp: Experience }) {
  const nextSlot = exp.slots.find((s) => s.available > 0);
  const reduceMotion = usePrefersReducedMotion();

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotX = useTransform(my, [0, 1], [5.5, -5.5]);
  const rotY = useTransform(mx, [0, 1], [-6.5, 6.5]);
  const springX = useSpring(rotX, { stiffness: 280, damping: 26, mass: 0.4 });
  const springY = useSpring(rotY, { stiffness: 280, damping: 26, mass: 0.4 });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const handleLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  const card = (
    <Link
      to="/experiences/$slug"
      params={{ slug: exp.slug }}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted/40 shadow-soft ring-1 ring-[oklch(0.88_0.08_86_/_0.22)] transition-shadow duration-500 group-hover:shadow-[var(--shadow-lift)]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-amber-100/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <img
          src={exp.image}
          alt={exp.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <div
          className="absolute top-3 left-3 z-20 flex gap-2"
          style={{ transform: "translateZ(24px)" }}
        >
          <span className="border border-[oklch(0.88_0.08_86_/_0.25)] bg-background/75 px-2.5 py-1 text-[0.65rem] uppercase tracking-wider text-foreground shadow-soft backdrop-blur-md">
            {exp.category}
          </span>
          {exp.verifiedHost && (
            <span className="border border-ember/40 bg-ember/95 px-2.5 py-1 text-[0.65rem] uppercase tracking-wider text-primary-foreground shadow-soft">
              Verified
            </span>
          )}
        </div>
      </div>
      <div className="flex justify-between gap-4 pt-4">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{exp.city}</div>
          <h3 className="mt-0.5 truncate font-display text-xl leading-tight">{exp.title}</h3>
          <div className="mt-1 text-sm text-ink-soft">
            {nextSlot
              ? `${nextSlot.available} seats · ${formatDateShort(nextSlot.date)}`
              : "Sold out"}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">From</div>
          <div className="font-display text-lg">
            {exp.currencySymbol ?? "€"}
            {exp.pricePerPerson}
          </div>
          <div className="mt-1 text-xs text-ember">★ {exp.rating}</div>
        </div>
      </div>
    </Link>
  );

  if (reduceMotion) return card;

  return (
    <div className="[perspective:1400px]" onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <motion.div style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}>
        {card}
      </motion.div>
    </div>
  );
}
