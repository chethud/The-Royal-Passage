import type { ReactNode } from "react";
import { motion } from "motion/react";
import heroPalaceImg from "@/assets/hero-image.png";
import { Header } from "@/components/site/Header";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type SignInHeroLayoutProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
};

const softEase = [0.22, 1, 0.36, 1] as const;

export function SignInHeroLayout({
  eyebrow,
  title,
  description,
  children,
}: SignInHeroLayoutProps) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div className="overflow-x-hidden bg-background text-foreground">
      <section className="relative min-h-[max(640px,100dvh)] w-full overflow-hidden border-b border-[oklch(0.72_0.09_78_/_0.18)]">
        <div className="absolute inset-0 z-0">
          <img
            src={heroPalaceImg}
            alt=""
            className="h-full w-full scale-[1.04] object-cover"
            fetchPriority="high"
            decoding="async"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(95deg,oklch(0.12_0.06_22_/_0.82)_0%,oklch(0.12_0.06_22_/_0.55)_45%,oklch(0.12_0.06_22_/_0.25)_75%,oklch(0.12_0.06_22_/_0.6)_100%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
            aria-hidden
          />
        </div>

        <Header />

        <div className="container-page relative z-10 flex min-h-[max(640px,100dvh)] flex-col justify-center pt-[var(--header-height)]">
          <div className="grid items-center gap-10 py-14 md:grid-cols-[minmax(0,1fr)_min(26rem,100%)] md:gap-12 lg:gap-16 lg:py-20">
            <motion.div
              className="max-w-xl"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: softEase }}
            >
              <div className="eyebrow mb-5 text-ember/95">{eyebrow}</div>
              <h1 className="font-display text-[clamp(2.2rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-tight text-ink text-balance [text-shadow:0_0.06em_0.4em_oklch(0.05_0.04_18_/_0.85)]">
                {title}
              </h1>
              <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-ink/85 text-balance sm:mt-7 sm:text-[1.05rem] md:max-w-lg">
                {description}
              </p>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.12, ease: softEase }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
