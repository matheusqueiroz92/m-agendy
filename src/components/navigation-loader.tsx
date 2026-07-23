"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

const OVERLAY_DELAY_MS = 300;
const COMPLETE_FADE_MS = 280;

function TopProgressBar({
  active,
  highContrast,
}: {
  active: boolean;
  highContrast: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;

    setVisible(true);
    setProgress(prefersReducedMotion ? 0.7 : 0.18);

    const timers = [
      window.setTimeout(() => setProgress(0.42), 180),
      window.setTimeout(() => setProgress(0.68), 520),
      window.setTimeout(() => setProgress(0.86), 1100),
    ];

    return () => timers.forEach(clearTimeout);
  }, [active, prefersReducedMotion]);

  useEffect(() => {
    if (active || !visible) return;

    setProgress(1);
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, COMPLETE_FADE_MS);

    return () => clearTimeout(hideTimer);
  }, [active, visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Carregando página"
        >
          <motion.div
            className={
              highContrast
                ? "h-full rounded-full bg-gradient-to-r from-white via-sky-100 to-white shadow-[0_0_14px_rgba(255,255,255,0.85)]"
                : "h-full rounded-full bg-gradient-to-r from-blue-400 via-blue-500 to-sky-400 shadow-[0_0_12px_rgba(59,130,246,0.55)]"
            }
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress }}
            transition={{
              duration: prefersReducedMotion ? 0.15 : 0.45,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformOrigin: "left" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OverlayLoader({ active }: { active: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[199] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          aria-live="polite"
          aria-busy="true"
        >
          <div className="absolute inset-0 bg-background/55 backdrop-blur-[6px]" />
          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.92, y: 8 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: -4 }
            }
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative flex h-16 w-16 items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-500/20"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { scale: [1, 1.15, 1], opacity: [0.5, 0.2, 0.5] }
                }
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute inset-1 rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400/60"
                animate={prefersReducedMotion ? undefined : { rotate: 360 }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
              <motion.div
                className="h-3 w-3 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 shadow-[0_0_16px_rgba(59,130,246,0.45)]"
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { scale: [1, 0.85, 1] }
                }
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <p className="text-muted-foreground text-sm font-medium tracking-wide">
              Carregando…
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function shouldStartNavigation(anchor: HTMLAnchorElement, event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }

  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function NavigationLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const navigationKeyRef = useRef(`${pathname}?${searchParams.toString()}`);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      if (!shouldStartNavigation(anchor, event)) return;
      setIsNavigating(true);
    };

    const onPopState = () => setIsNavigating(true);

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  useEffect(() => {
    const nextKey = `${pathname}?${searchParams.toString()}`;
    if (nextKey === navigationKeyRef.current) return;

    navigationKeyRef.current = nextKey;
    setIsNavigating(false);
    setShowOverlay(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!isNavigating) {
      setShowOverlay(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowOverlay(true);
    }, OVERLAY_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isNavigating]);

  useEffect(() => {
    if (!isNavigating) return;

    const safetyTimer = window.setTimeout(() => {
      setIsNavigating(false);
      setShowOverlay(false);
    }, 10_000);

    return () => clearTimeout(safetyTimer);
  }, [isNavigating]);

  const isOnBlueBackground = pathname.startsWith("/auth");

  return (
    <>
      <TopProgressBar
        active={isNavigating}
        highContrast={isOnBlueBackground}
      />
      <OverlayLoader active={showOverlay} />
    </>
  );
}

export function NavigationLoader() {
  return (
    <Suspense fallback={null}>
      <NavigationLoaderInner />
    </Suspense>
  );
}
