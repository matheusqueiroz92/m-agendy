"use client";

import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";

import { createStripeCheckout } from "@/actions/create-stripe-checkout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

interface PricingCardProps {
  active?: boolean;
  userEmail?: string;
  planName?: string;
  price?: number;
  features?: string[];
  description?: string;
}

export const SubscriptionPlan = ({
  active,
  userEmail,
  planName,
  features,
  price,
  description,
}: PricingCardProps) => {
  const router = useRouter();

  const createStripeCheckoutAction = useAction(createStripeCheckout, {
    onSuccess: async ({ data }) => {
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        throw new Error("Stripe publishable key is not set");
      }

      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      );

      if (!stripe) {
        throw new Error("Stripe is not loaded");
      }

      if (!data?.sessionId) {
        throw new Error("Session ID is not found");
      }

      await stripe?.redirectToCheckout({ sessionId: data?.sessionId });
    },
  });

  const handleSubscribeClick = async () => {
    createStripeCheckoutAction.execute();
  };

  const handleManageSubscriptionClick = () => {
    router.push(
      `${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL}?prefilled_email=${userEmail}`,
    );
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-bold">{planName}</h3>
          {active && (
            <Badge
              variant="secondary"
              className="bg-chart-2/10 text-chart-2 hover:bg-chart-2/20"
            >
              Atual
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardHeader>

      <CardContent className="pb-6">
        <div className="mb-6">
          <span className="text-3xl font-bold">
            <span className="text-muted-foreground text-xl">R$</span>
            {price}
          </span>
          <span className="text-muted-foreground ml-1">/mês</span>
        </div>

        <ul className="space-y-3">
          {features?.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <CheckCircle className="text-chart-2 h-5 w-5" />
              </div>
              <span className="text-muted-foreground text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="relative w-full overflow-hidden rounded-full border-2 border-neutral-300 bg-white/80 text-sm font-semibold shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg focus:ring-2 focus:ring-blue-200"
          variant={active ? "outline" : "default"}
          onClick={
            active ? handleManageSubscriptionClick : handleSubscribeClick
          }
          disabled={createStripeCheckoutAction.isExecuting}
        >
          {createStripeCheckoutAction.isExecuting ? (
            <Loader2 className="h4 mr-1 w-4 animate-spin" />
          ) : active ? (
            <span className="relative z-10">Gerenciar Assinatura</span>
          ) : (
            <span className="relative z-10">Fazer Assinatura</span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
