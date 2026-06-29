import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
  type Transition,
  type Variants,
} from "motion/react";
import { useRef, type ElementType, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export const scrollRevealEase = [0.22, 1, 0.36, 1] as const;

export const scrollRevealViewport = { once: true, margin: "-8%" as const };

export const scroll3dPerspective = 1400;

const scrollRevealSpring: Transition = {
  type: "spring",
  stiffness: 62,
  damping: 22,
  mass: 0.85,
};

const scrollReveal3dSpring: Transition = {
  type: "spring",
  stiffness: 56,
  damping: 20,
  mass: 0.95,
};

const scrollParallaxSpring = {
  stiffness: 78,
  damping: 26,
  mass: 0.4,
  restDelta: 0.0008,
};

export const scrollRevealStaggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.03 } },
};

export const scrollRevealStaggerChild: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: scrollRevealSpring },
};

export const scrollReveal3dStaggerChild: Variants = {
  hidden: { opacity: 0, y: 28, rotateX: 10, scale: 0.96, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: scrollReveal3dSpring,
  },
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
  depth3d?: boolean;
};

export function ScrollReveal({
  as = "div",
  children,
  delay = 0,
  offsetY = 20,
  depth3d = false,
  transition,
  viewport = scrollRevealViewport,
  style,
  ...props
}: ScrollRevealProps) {
  const reduceMotion = usePrefersReducedMotion();
  const Component = motionTags[as] as ElementType;

  const initial = depth3d
    ? { opacity: 0, y: offsetY + 12, rotateX: 10, scale: 0.96, filter: "blur(4px)" }
    : { opacity: 0, y: offsetY };

  const animate = depth3d
    ? { opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)" }
    : { opacity: 1, y: 0 };

  const baseTransition = depth3d ? scrollReveal3dSpring : scrollRevealSpring;

  return (
    <Component
      initial={reduceMotion ? false : initial}
      whileInView={animate}
      viewport={viewport}
      transition={{
        ...baseTransition,
        delay,
        ...transition,
      }}
      style={{
        transformPerspective: depth3d ? scroll3dPerspective : undefined,
        transformOrigin: depth3d ? "50% 85%" : undefined,
        backfaceVisibility: depth3d ? "hidden" : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </Component>
  );
}

type ScrollParallaxSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  intensity?: "subtle" | "medium";
};

export function ScrollParallaxSection({
  children,
  className,
  id,
  intensity = "medium",
}: ScrollParallaxSectionProps) {
  const reduceMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "end 0.08"],
  });

  const smoothProgress = useSpring(scrollYProgress, scrollParallaxSpring);

  const tilt = intensity === "subtle" ? 5 : 7;
  const lift = intensity === "subtle" ? 18 : 28;

  const rotateX = useTransform(
    smoothProgress,
    [0, 0.2, 0.38, 0.5, 0.62, 0.8, 1],
    [tilt, tilt * 0.45, 0, 0, 0, -tilt * 0.35, -tilt * 0.6],
  );
  const y = useTransform(
    smoothProgress,
    [0, 0.2, 0.38, 0.5, 0.62, 0.8, 1],
    [lift, lift * 0.4, 0, 0, 0, -lift * 0.3, -lift * 0.5],
  );
  const scale = useTransform(
    smoothProgress,
    [0, 0.2, 0.38, 0.5, 0.62, 0.8, 1],
    [0.97, 0.99, 1, 1, 1, 0.995, 0.985],
  );
  const opacity = useTransform(
    smoothProgress,
    [0, 0.15, 0.35, 0.65, 0.85, 1],
    [0.82, 0.94, 1, 1, 0.96, 0.9],
  );

  if (reduceMotion) {
    return (
      <div id={id} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div
      id={id}
      ref={ref}
      className={className}
      style={{ perspective: scroll3dPerspective, perspectiveOrigin: "50% 22%" }}
    >
      <ParallaxLayer rotateX={rotateX} y={y} scale={scale} opacity={opacity}>
        {children}
      </ParallaxLayer>
    </div>
  );
}

function ParallaxLayer({
  children,
  rotateX,
  y,
  scale,
  opacity,
}: {
  children: ReactNode;
  rotateX: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  opacity: MotionValue<number>;
}) {
  return (
    <motion.div
      className="scroll-parallax-3d will-change-transform"
      style={{
        rotateX,
        y,
        scale,
        opacity,
        transformStyle: "preserve-3d",
        transformOrigin: "50% 18%",
      }}
    >
      {children}
    </motion.div>
  );
}

type ScrollRevealGroupProps = {
  children: ReactNode;
  className?: string;
  depth3d?: boolean;
};

export function ScrollRevealGroup({ children, className, depth3d = false }: ScrollRevealGroupProps) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <motion.div
      className={className}
      variants={scrollRevealStaggerParent}
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={scrollRevealViewport}
      style={{
        transformPerspective: depth3d ? scroll3dPerspective : undefined,
        transformStyle: depth3d ? "preserve-3d" : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollRevealItem({
  children,
  className,
  depth3d = false,
}: {
  children: ReactNode;
  className?: string;
  depth3d?: boolean;
}) {
  return (
    <motion.div
      className={className}
      variants={depth3d ? scrollReveal3dStaggerChild : scrollRevealStaggerChild}
      style={
        depth3d
          ? {
              transformPerspective: scroll3dPerspective,
              transformOrigin: "50% 85%",
              backfaceVisibility: "hidden",
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
}
