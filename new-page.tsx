import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubscriptionPlanCardProps {
  userEmail: string;
  planName: string;
  description: string;
  features: string[];
  price: number;
  variant: "default" | "featured";
  badge?: string;
}

export function SubscriptionPlanCard({
  planName,
  description,
  features,
  price,
  variant = "default",
  badge,
}: SubscriptionPlanCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:shadow-md",
        variant === "featured"
          ? "z-10 scale-105 border-slate-800 bg-slate-800 text-white"
          : "border-slate-200 bg-white",
      )}
    >
      {badge && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 hover:bg-amber-400">
          {badge}
        </Badge>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h3
          className={cn(
            "text-xl font-bold",
            variant === "featured" ? "text-white" : "text-slate-800",
          )}
        >
          {planName}
        </h3>
      </div>

      <p
        className={cn(
          "mb-4 text-sm",
          variant === "featured" ? "text-slate-200" : "text-slate-500",
        )}
      >
        {description}
      </p>

      <div className="mb-6">
        <span
          className={cn(
            "text-4xl font-bold",
            variant === "featured" ? "text-white" : "text-slate-800",
          )}
        >
          R${price}
        </span>
        <span
          className={cn(
            "text-sm",
            variant === "featured" ? "text-slate-300" : "text-slate-500",
          )}
        >
          /mês
        </span>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {features.map((feature, index) => (
          <li
            key={index}
            className={cn(
              "flex items-start gap-2 text-sm",
              variant === "featured" ? "text-white" : "text-slate-600",
            )}
          >
            <Check
              className={cn(
                "h-5 w-5 shrink-0",
                variant === "featured" ? "text-amber-400" : "text-slate-800",
              )}
            />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        className={cn(
          "w-full",
          variant === "featured"
            ? "bg-amber-400 text-slate-900 hover:bg-amber-500"
            : "bg-slate-800 text-white hover:bg-slate-700",
        )}
      >
        Assinar {planName}
      </Button>

      <p
        className={cn(
          "mt-4 text-center text-xs",
          variant === "featured" ? "text-slate-300" : "text-slate-500",
        )}
      >
        7 dias de teste grátis
      </p>
    </div>
  );
}
