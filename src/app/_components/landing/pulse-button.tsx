"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

interface PulseButtonProps
  extends React.ComponentProps<typeof Button> {
  href?: string;
  pulse?: boolean;
}

export function PulseButton({
  children,
  className,
  href,
  pulse = true,
  asChild,
  ...props
}: PulseButtonProps) {
  const reducedMotion = useReducedMotion();

  const buttonClassName = cn(
    "relative h-11 px-6 text-sm font-semibold sm:h-12 sm:px-8 sm:text-base",
    pulse && !reducedMotion && "landing-cta-pulse",
    className,
  );

  const content = href ? (
    <Button asChild className={buttonClassName} {...props}>
      <Link href={href}>{children}</Link>
    </Button>
  ) : (
    <Button className={buttonClassName} asChild={asChild} {...props}>
      {children}
    </Button>
  );

  if (!pulse || reducedMotion || href) {
    return content;
  }

  return (
    <motion.div
      className="inline-flex w-full sm:w-auto"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {content}
    </motion.div>
  );
}
