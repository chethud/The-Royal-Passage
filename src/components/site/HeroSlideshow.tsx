import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type HeroSlideshowProps = {
  images: Array<{ src: string; alt: string }>;
  intervalMs?: number;
  reduceMotion?: boolean;
  className?: string;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
};

const softEase = [0.22, 1, 0.36, 1] as const;

export function HeroSlideshow({
  images,
  intervalMs = 3600,
  reduceMotion = false,
  className,
  activeIndex: controlledIndex,
  onActiveIndexChange,
}: HeroSlideshowProps) {
  const safeImages = useMemo(() => images.filter((i) => Boolean(i?.src)), [images]);
  const [uncontrolledIndex, setUncontrolledIndex] = useState(0);
  const isControlled = controlledIndex !== undefined;
  const active = isControlled ? controlledIndex : uncontrolledIndex;

  const setActive = useCallback(
    (next: number) => {
      if (safeImages.length === 0) return;
      const normalized = ((next % safeImages.length) + safeImages.length) % safeImages.length;
      if (onActiveIndexChange) {
        onActiveIndexChange(normalized);
      } else {
        setUncontrolledIndex(normalized);
      }
    },
    [onActiveIndexChange, safeImages.length],
  );

  // Keep upcoming slides decoded so a fade never lands on an empty decode frame.
  useEffect(() => {
    if (safeImages.length <= 1) return;
    const preload = safeImages.map((image) => {
      const img = new Image();
      img.decoding = "async";
      img.src = image.src;
      return img;
    });
    return () => {
      for (const img of preload) {
        img.src = "";
      }
    };
  }, [safeImages]);

  useEffect(() => {
    if (reduceMotion) return;
    if (safeImages.length <= 1) return;
    const id = window.setInterval(() => {
      setActive(active + 1);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs, reduceMotion, safeImages.length, setActive]);

  if (safeImages.length === 0) return null;

  return (
    <div className={cn("overflow-hidden bg-[oklch(0.12_0.06_22)]", className)}>
      {safeImages.map((image, index) => {
        const isActive = index === active;
        return (
          <motion.img
            key={image.src}
            src={image.src}
            alt={isActive ? image.alt : ""}
            aria-hidden={!isActive}
            loading="eager"
            decoding="async"
            fetchPriority={index === 0 ? "high" : "low"}
            className="absolute inset-0 h-full w-full object-cover"
            initial={false}
            animate={{
              opacity: isActive ? 1 : 0,
              scale: reduceMotion ? 1 : isActive ? 1.04 : 1.02,
            }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 1.05, ease: softEase }
            }
            style={{ zIndex: isActive ? 2 : 1 }}
          />
        );
      })}
    </div>
  );
}
