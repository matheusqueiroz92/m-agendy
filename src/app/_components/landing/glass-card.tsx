"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { useCallback, useRef } from "react";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName?: string;
  iconBgClassName?: string;
  className?: string;
  delay?: number;
}

export function GlassCard({
  title,
  description,
  icon: Icon,
  iconClassName,
  iconBgClassName,
  className,
  delay = 0,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      cardRef.current.style.setProperty("--spotlight-x", `${x}px`);
      cardRef.current.style.setProperty("--spotlight-y", `${y}px`);
    },
    [reducedMotion],
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--spotlight-x", "50%");
    cardRef.current.style.setProperty("--spotlight-y", "50%");
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "landing-glass-card group relative overflow-hidden rounded-2xl p-5 sm:p-6",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        reducedMotion
          ? undefined
          : { y: -6, scale: 1.02, transition: { duration: 0.25 } }
      }
      style={{ willChange: "transform" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(280px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), oklch(0.58 0.16 245 / 12%), transparent 65%)",
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <motion.div
            className={cn(
              "mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
              iconBgClassName ?? "bg-cta/10",
            )}
            whileHover={reducedMotion ? undefined : { rotate: [0, -8, 8, 0] }}
            transition={{ duration: 0.45 }}
          >
            <Icon
              className={cn("size-6", iconClassName ?? "text-cta")}
              aria-hidden="true"
            />
          </motion.div>
          <h3 className="text-foreground mb-2 text-base font-semibold tracking-tight">
            {title}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
