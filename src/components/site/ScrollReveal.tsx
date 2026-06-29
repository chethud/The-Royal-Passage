import { motion, type HTMLMotionProps, type Variants } from "motion/react";
import type { ElementType, ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export const scrollRevealEase = [0.22, 1, 0.36, 1] as const;

export const scrollRevealViewport = { once: true, margin: "-10%" as const };

export const scrollRevealStaggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

export const scrollRevealStaggerChild: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: scrollRevealEase } },
};

const motionTags = {
  div: motion.div,
  article: motion.article,
  section: motion.section,
} as const;

type ScrollRevealTag = keyof typeof motionTags;

type ScrollRevealProps = HTMLMotionProps<"div"> & {
  as?: ScrollRevealTag;
  delay?: number;
  offsetY?: number;
};

export function ScrollReveal({
  as = "div",
  children,
  delay = 0,
  offsetY = 20,
  transition,
  viewport = scrollRevealViewport,
  ...props
}: ScrollRevealProps) {
  const reduceMotion = usePrefersReducedMotion();
  const Component = motionTags[as] as ElementType;

  return (
    <Component
      initial={reduceMotion ? false : { opacity: 0, y: offsetY }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{
        duration: 0.65,
        delay,
        ease: scrollRevealEase,
        ...transition,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

type ScrollRevealGroupProps = {
  children: ReactNode;
  className?: string;
};

export function ScrollRevealGroup({ children, className }: ScrollRevealGroupProps) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className={className}
      variants={scrollRevealStaggerParent}
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={scrollRevealViewport}
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={scrollRevealStaggerChild}>
      {children}
    </motion.div>
  );
}
