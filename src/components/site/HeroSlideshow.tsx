import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

type HeroSlideshowProps = {
  images: Array<{ src: string; alt: string }>;
  intervalMs?: number;
  reduceMotion?: boolean;
  className?: string;
};

const softEase = [0.22, 1, 0.36, 1] as const;

export function HeroSlideshow({
  images,
  intervalMs = 3600,
  reduceMotion = false,
  className,
}: HeroSlideshowProps) {
  const safeImages = useMemo(() => images.filter((i) => Boolean(i?.src)), [images]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    if (safeImages.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % safeImages.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, reduceMotion, safeImages.length]);

  const current = safeImages[Math.min(active, Math.max(0, safeImages.length - 1))];
  if (!current) return null;

  const isFirstSlide = current.src === safeImages[0]?.src;

  return (
    <div className={className}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={current.src}
          src={current.src}
          alt={current.alt}
          loading={isFirstSlide ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={isFirstSlide ? "high" : "low"}
          className="h-full w-full object-cover"
          initial={reduceMotion ? false : { opacity: 0, scale: 1.02, filter: "blur(3px)" }}
          animate={{ opacity: 1, scale: 1.04, filter: "blur(0px)" }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 1.01, filter: "blur(4px)" }}
          transition={{ duration: 0.9, ease: softEase }}
        />
      </AnimatePresence>
    </div>
  );
}
