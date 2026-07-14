import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import logoUrl from "@/assets/logo/logo.png";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type HomeIntroContextValue = {
  splashDone: boolean;
  /** Hero chrome unlocked after a tiny scroll (never auto). */
  copyRevealed: boolean;
  /** Hero text wiped left after 5s idle while visible. */
  copyWiped: boolean;
  /** Navbar arrives after copy animation */
  navRevealed: boolean;
};

const HomeIntroContext = createContext<HomeIntroContextValue | null>(null);

export function useHomeIntro() {
  return useContext(HomeIntroContext);
}

const SPLASH_MS = 1800;
/** Tiny threshold — any near-immediate scroll unlocks the hero chrome. */
const REVEAL_SCROLL_PX = 2;
/** After text is on screen, idle wipe to the left. */
const IDLE_WIPE_MS = 5000;
/** Navbar follows copy almost immediately. */
const NAV_AFTER_COPY_MS = 120;

export function HomeIntroProvider({ children }: { children: ReactNode }) {
  const reduceMotion = usePrefersReducedMotion();
  const [splashDone, setSplashDone] = useState(reduceMotion);
  const [copyRevealed, setCopyRevealed] = useState(reduceMotion);
  const [copyWiped, setCopyWiped] = useState(false);
  const [navRevealed, setNavRevealed] = useState(reduceMotion);

  useEffect(() => {
    if (reduceMotion) {
      setSplashDone(true);
      setCopyRevealed(true);
      setCopyWiped(false);
      setNavRevealed(true);
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      document.body.style.overflow = previousOverflow;
      setSplashDone(true);
    }, SPLASH_MS);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [reduceMotion]);

  // Unlock chrome only on intentional tiny scroll / wheel / touch / keys — never by timer.
  useEffect(() => {
    if (!splashDone || copyRevealed || reduceMotion) return;

    const reveal = () => {
      setCopyRevealed(true);
      setCopyWiped(false);
    };

    const onScroll = () => {
      if (window.scrollY >= REVEAL_SCROLL_PX) reveal();
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) >= 1 || Math.abs(event.deltaX) >= 1) reveal();
    };

    const onTouchMove = () => reveal();

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "ArrowDown" ||
        event.key === "ArrowUp" ||
        event.key === "PageDown" ||
        event.key === "PageUp" ||
        event.key === " " ||
        event.key === "Home" ||
        event.key === "End"
      ) {
        reveal();
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [splashDone, copyRevealed, reduceMotion]);

  useEffect(() => {
    if (!copyRevealed || navRevealed || reduceMotion) return;
    const timer = window.setTimeout(() => setNavRevealed(true), NAV_AFTER_COPY_MS);
    return () => window.clearTimeout(timer);
  }, [copyRevealed, navRevealed, reduceMotion]);

  // Once text is showing, wipe it left if the visitor stays still for 5s.
  useEffect(() => {
    if (!copyRevealed || copyWiped || reduceMotion) return;

    let wipeTimer = window.setTimeout(() => setCopyWiped(true), IDLE_WIPE_MS);

    const bumpIdle = () => {
      window.clearTimeout(wipeTimer);
      wipeTimer = window.setTimeout(() => setCopyWiped(true), IDLE_WIPE_MS);
    };

    const onActivity = () => {
      if (copyWiped) return;
      bumpIdle();
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) >= 1 || Math.abs(event.deltaX) >= 1) onActivity();
    };

    window.addEventListener("scroll", onActivity, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onActivity, { passive: true });
    window.addEventListener("pointerdown", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);

    return () => {
      window.clearTimeout(wipeTimer);
      window.removeEventListener("scroll", onActivity);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onActivity);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [copyRevealed, copyWiped, reduceMotion]);

  // After a wipe, another tiny scroll can bring the text back.
  useEffect(() => {
    if (!copyRevealed || !copyWiped || reduceMotion) return;

    const restore = () => setCopyWiped(false);

    const onScroll = () => {
      if (window.scrollY >= REVEAL_SCROLL_PX) restore();
    };
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) >= 1 || Math.abs(event.deltaX) >= 1) restore();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", restore, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", restore);
    };
  }, [copyRevealed, copyWiped, reduceMotion]);

  const value = useMemo(
    () => ({ splashDone, copyRevealed, copyWiped, navRevealed }),
    [splashDone, copyRevealed, copyWiped, navRevealed],
  );

  return <HomeIntroContext.Provider value={value}>{children}</HomeIntroContext.Provider>;
}

export function HomeBrandSplash() {
  const intro = useHomeIntro();
  const reduceMotion = usePrefersReducedMotion();
  const visible = intro ? !intro.splashDone : false;

  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="home-brand-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          <motion.img
            src={logoUrl}
            alt=""
            width={320}
            height={110}
            className="home-brand-splash__logo"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Full-viewport logo loader for auth/route gates. */
export function BrandLogoLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="brand-logo-loader" aria-busy="true" aria-label={label}>
      <img
        src={logoUrl}
        alt=""
        width={260}
        height={90}
        className="brand-logo-loader__logo"
      />
    </div>
  );
}
