"use client";

import dayjs from "dayjs";
import { CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { createStripeCheckout } from "@/actions/create-stripe-checkout";
import { startTrial } from "@/actions/start-trial";
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
  /** Id do plano no catálogo (essential/premium/gold...). */
  planId?: string;
  planName?: string;
  price?: number;
  features?: string[];
  description?: string;
  /** Dias de teste grátis self-service (undefined = sem trial neste plano). */
  trialDays?: number;
  /** Usuário pode iniciar o trial deste plano (sem plano ativo e nunca usou). */
  trialEligible?: boolean;
  /** O plano ativo do usuário É este plano E ainda está em período de trial. */
  isTrialActive?: boolean;
  /** Validade do plano ativo, quando em trial (para exibir a contagem). */
  planExpiresAt?: Date | null;
}

export const SubscriptionPlan = ({
  active,
  userEmail,
  planId = "premium",
  planName,
  features,
  price,
  description,
  trialDays,
  trialEligible,
  isTrialActive,
  planExpiresAt,
}: PricingCardProps) => {
  const router = useRouter();

  const createStripeCheckoutAction = useAction(createStripeCheckout, {
    onSuccess: ({ data }) => {
      // Redireciona para o checkout hospedado do gateway ativo. Agnóstico de
      // provedor: a UI só precisa da URL devolvida pelo caso de uso.
      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Não foi possível iniciar a assinatura.");
    },
  });

  const startTrialAction = useAction(startTrial, {
    onSuccess: () => {
      toast.success(`Teste grátis de ${trialDays} dias iniciado. Aproveite!`);
      router.push("/dashboard");
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Não foi possível iniciar o teste grátis.");
    },
  });

  const handleSubscribeClick = () => {
    createStripeCheckoutAction.execute({ plan: planId });
  };

  const handleStartTrialClick = () => {
    startTrialAction.execute({ plan: planId });
  };

  const handleManageSubscriptionClick = () => {
    router.push(
      `${process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL}?prefilled_email=${userEmail}`,
    );
  };

  const showTrialButton = !active && trialDays && trialEligible;
  // Em trial não existe assinatura na Stripe ainda: o botão precisa levar ao
  // checkout (vira pagante), não ao portal de gerenciamento.
  const manageIsCheckout = active && isTrialActive;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-bold">{planName}</h3>
          {isTrialActive ? (
            <Badge
              variant="secondary"
              className="bg-cta/10 text-cta hover:bg-cta/20"
            >
              Teste grátis
            </Badge>
          ) : (
            active && (
              <Badge
                variant="secondary"
                className="bg-chart-2/10 text-chart-2 hover:bg-chart-2/20"
              >
                Atual
              </Badge>
            )
          )}
        </div>
        <p className="text-muted-foreground text-sm">{description}</p>
        {isTrialActive && planExpiresAt && (
          <p className="text-cta text-xs font-medium">
            Termina em {dayjs(planExpiresAt).format("DD/MM/YYYY")} — assine para
            continuar depois.
          </p>
        )}
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

      <CardFooter className="flex flex-col gap-2">
        {showTrialButton && (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleStartTrialClick}
            disabled={startTrialAction.isExecuting}
          >
            {startTrialAction.isExecuting ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              `Começar grátis por ${trialDays} dias`
            )}
          </Button>
        )}

        <Button
          className="relative w-full overflow-hidden rounded-full border-2 border-neutral-300 bg-white/80 text-sm font-semibold shadow-md transition-all duration-300 ease-in-out hover:scale-105 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 hover:shadow-lg focus:ring-2 focus:ring-blue-200"
          variant={active && !manageIsCheckout ? "outline" : "default"}
          onClick={
            manageIsCheckout
              ? handleSubscribeClick
              : active
                ? handleManageSubscriptionClick
                : handleSubscribeClick
          }
          disabled={createStripeCheckoutAction.isExecuting}
        >
          {createStripeCheckoutAction.isExecuting ? (
            <Loader2 className="h4 mr-1 w-4 animate-spin" />
          ) : manageIsCheckout ? (
            <span className="relative z-10">Assinar agora</span>
          ) : active ? (
            <span className="relative z-10">Gerenciar Assinatura</span>
          ) : (
            <span className="relative z-10">
              {showTrialButton ? "Assinar agora (sem trial)" : "Fazer Assinatura"}
            </span>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
