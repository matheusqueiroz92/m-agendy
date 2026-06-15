"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

import { PARTNER_LOGOS } from "./partner-logos";

function LogoItem({
  Logo,
  className,
  ariaHidden = false,
}: {
  Logo: (typeof PARTNER_LOGOS)[number]["Logo"];
  className?: string;
  ariaHidden?: boolean;
}) {
  return (
    <li
      className={cn(
        "text-muted-foreground/70 flex w-36 shrink-0 items-center justify-center transition-[color,opacity] duration-300 hover:text-foreground/80 sm:w-48 md:w-52",
        className,
      )}
      aria-hidden={ariaHidden || undefined}
    >
      <Logo />
    </li>
  );
}

export function SocialProofSection() {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const setMeasureRef = useRef<HTMLUListElement>(null);
  const [setWidth, setSetWidth] = useState(0);
  const [copyCount, setCopyCount] = useState(2);

  useEffect(() => {
    if (reducedMotion) return;

    const container = containerRef.current;
    const measure = setMeasureRef.current;
    if (!container || !measure) return;

    const updateMarquee = () => {
      const containerWidth = container.offsetWidth;
      const measuredSetWidth = measure.offsetWidth;

      if (measuredSetWidth <= 0) return;

      setSetWidth(measuredSetWidth);
      setCopyCount(
        Math.max(2, Math.ceil((containerWidth * 2) / measuredSetWidth) + 1),
      );
    };

    updateMarquee();

    const resizeObserver = new ResizeObserver(updateMarquee);
    resizeObserver.observe(container);
    resizeObserver.observe(measure);

    return () => resizeObserver.disconnect();
  }, [reducedMotion]);

  const isMarqueeReady = setWidth > 0;

  return (
    <section
      aria-labelledby="social-proof-heading"
      className="relative border-t border-border/60 py-8 sm:py-12"
    >
      <div className="landing-social-proof-fade pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-24" aria-hidden="true" />
      <div className="landing-social-proof-fade pointer-events-none absolute inset-y-0 right-0 z-10 w-16 scale-x-[-1] sm:w-24" aria-hidden="true" />

      <div className="container relative mx-auto px-4">
        <p
          id="social-proof-heading"
          className="text-muted-foreground mb-6 text-center text-sm font-medium tracking-wide text-pretty sm:mb-8 sm:text-base"
        >
          Já utilizado por clínicas e consultórios em todo o Brasil
        </p>

        {reducedMotion ? (
          <ul className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
            {PARTNER_LOGOS.map(({ id, Logo }) => (
              <LogoItem key={id} Logo={Logo} />
            ))}
          </ul>
        ) : (
          <div
            ref={containerRef}
            className="landing-marquee-mask overflow-hidden"
            role="region"
            aria-label="Clínicas parceiras"
          >
            <ul
              ref={setMeasureRef}
              aria-hidden="true"
              className="pointer-events-none absolute flex opacity-0"
              tabIndex={-1}
            >
              {PARTNER_LOGOS.map(({ id, Logo }) => (
                <LogoItem key={`measure-${id}`} Logo={Logo} />
              ))}
            </ul>

            <ul
              className={cn(
                "landing-marquee-track flex w-max items-center",
                !isMarqueeReady && "opacity-0",
              )}
              style={
                isMarqueeReady
                  ? ({ "--marquee-shift": `${setWidth}px` } as React.CSSProperties)
                  : undefined
              }
            >
              {Array.from({ length: copyCount }, (_, copyIndex) =>
                PARTNER_LOGOS.map(({ id, Logo }) => (
                  <LogoItem
                    key={`${copyIndex}-${id}`}
                    Logo={Logo}
                    ariaHidden={copyIndex > 0}
                  />
                )),
              )}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
