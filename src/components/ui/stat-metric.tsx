import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatMetricProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  className?: string;
}

export function StatMetric({
  label,
  value,
  icon: Icon,
  className,
}: StatMetricProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card px-5 py-4",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon
            className="text-muted-foreground size-4 shrink-0"
            aria-hidden="true"
          />
        )}
        <span className="text-muted-foreground text-sm font-medium">
          {label}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
    </div>
  );
}
