import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import logoUrl from "@/assets/logo/logo.png";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type HomeIntroContextValue = {
  splashDone: boolean;
  /** Hero chrome unlocked after photo zoom beat (or early scroll). */
  copyRevealed: boolean;
  /** Hero text wiped left after 5s idle; restored on scroll / interaction. */
  copyWiped: boolean;
  /** Navbar arrives after copy animation */
  navRevealed: boolean;
};

const HomeIntroContext = createContext<HomeIntroContextValue | null>(null);

export function useHomeIntro() {
  return useContext(HomeIntroContext);
}

const SPLASH_MS = 1800;
/** Photo-only zoom beat after splash before hero text arrives. */
const PHOTO_ZOOM_BEFORE_COPY_MS = 2500;
/** Tiny threshold — scroll can unlock text early during the zoom beat. */
const REVEAL_SCROLL_PX = 2;
/** After text is on screen, idle wipe to the left. */
const IDLE_WIPE_MS = 5000;
/** Navbar slides in shortly after text starts. */
const NAV_AFTER_COPY_MS = 450;

export function HomeIntroProvider({ children }: { children: ReactNode }) {
  const reduceMotion = usePrefersReducedMotion();
  const [splashDone, setSplashDone] = useState(reduceMotion);
  const [copyRevealed, setCopyRevealed] = useState(reduceMotion);
  const [copyWiped, setCopyWiped] = useState(false);
  const [navRevealed, setNavRevealed] = useState(reduceMotion);
  const navTimerRef = useRef<number | undefined>(undefined);

  const scheduleNavReveal = () => {
    window.clearTimeout(navTimerRef.current);
    navTimerRef.current = window.setTimeout(() => {
      setNavRevealed(true);
    }, NAV_AFTER_COPY_MS);
  };

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

  // After splash: photo zooms alone ~2.5s, then text + navbar arrive automatically.
  // Scroll / wheel / touch / keys can still unlock earlier.
  useEffect(() => {
    if (!splashDone || copyRevealed || reduceMotion) return;

    const revealChrome = () => {
      setCopyRevealed(true);
      setCopyWiped(false);
      scheduleNavReveal();
    };

    const timer = window.setTimeout(revealChrome, PHOTO_ZOOM_BEFORE_COPY_MS);

    const revealEarly = () => {
      window.clearTimeout(timer);
      revealChrome();
    };

    const onScroll = () => {
      if (window.scrollY >= REVEAL_SCROLL_PX) revealEarly();
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) >= 1 || Math.abs(event.deltaX) >= 1) revealEarly();
    };

    const onTouchMove = () => revealEarly();

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
        revealEarly();
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [splashDone, copyRevealed, reduceMotion]);

  // Safety net if copy unlocks without going through revealChrome.
  useEffect(() => {
    if (!copyRevealed || navRevealed || reduceMotion) return;
    scheduleNavReveal();
  }, [copyRevealed, navRevealed, reduceMotion]);

  useEffect(() => {
    return () => window.clearTimeout(navTimerRef.current);
  }, []);

  // Once text is showing, wipe it left if the visitor stays still for 5s.
  // Scroll / wheel / touch / keys restore it and restart the idle timer.
  useEffect(() => {
    if (!copyRevealed || reduceMotion) return;

    let wipeTimer: number | undefined;

    const scheduleWipe = () => {
      window.clearTimeout(wipeTimer);
      wipeTimer = window.setTimeout(() => setCopyWiped(true), IDLE_WIPE_MS);
    };

    const onActivity = (event?: Event) => {
      if (event instanceof WheelEvent) {
        if (Math.abs(event.deltaY) < 1 && Math.abs(event.deltaX) < 1) return;
      }
      setCopyWiped(false);
      scheduleWipe();
    };

    if (!copyWiped) {
      scheduleWipe();
    }

    window.addEventListener("scroll", onActivity, { passive: true });
    window.addEventListener("wheel", onActivity, { passive: true });
    window.addEventListener("touchmove", onActivity, { passive: true });
    window.addEventListener("pointerdown", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);

    return () => {
      window.clearTimeout(wipeTimer);
      window.removeEventListener("scroll", onActivity);
      window.removeEventListener("wheel", onActivity);
      window.removeEventListener("touchmove", onActivity);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
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
