# Conectando um novo gateway de pagamento

O módulo `billing` é **agnóstico de gateway**. A regra de negócio só conhece duas
portas e um evento normalizado; cada provedor (Stripe, **Pagar.me**,
**Mercado Pago**, ...) é um **adapter**.

## Contrato (portas)

`core/modules/billing/application/ports/payment-gateway.ts`:

```ts
export interface PaymentGateway {
  // cria o checkout de assinatura e devolve a URL hospedada
  createCheckoutSession(input: CreateCheckoutInput): Promise<CheckoutSession>;
  // valida a assinatura do webhook e traduz para um evento de domínio
  parseWebhookEvent(input: ParseWebhookInput): Promise<BillingEvent>;
}
```

Evento normalizado (`domain/billing-event.ts`):

```ts
type BillingEvent =
  | { type: "subscription_activated"; userId; customerId; subscriptionId; plan }
  | { type: "subscription_cancelled"; userId }
  | { type: "ignored" };
```

Os casos de uso (`CreateCheckoutSessionUseCase`, `HandleBillingWebhookUseCase`)
**não conhecem nenhum provedor** — só as portas. A UI usa apenas a `checkoutUrl`.

## Passo a passo para um novo provedor (ex.: Pagar.me)

### 1. Criar o adapter
`core/modules/billing/infra/gateways/pagarme-payment-gateway.ts`:

```ts
export class PagarMePaymentGateway implements PaymentGateway {
  constructor(private readonly config: { apiKey?: string; webhookSecret?: string; ... }) {}

  async createCheckoutSession(input) {
    // chama a API do Pagar.me, cria a assinatura/checkout
    // grava input.userId no metadata p/ recuperar no webhook
    return { checkoutUrl: /* URL hospedada do provedor */ };
  }

  async parseWebhookEvent({ rawBody, signature }) {
    // 1) valida a assinatura do webhook do Pagar.me
    // 2) mapeia o evento do provedor para o BillingEvent:
    //    pagamento confirmado  → "subscription_activated"
    //    assinatura cancelada  → "subscription_cancelled"
    //    qualquer outro        → "ignored"
  }
}
```

> **Importante:** sempre persista o `userId` no metadata da assinatura no
> provedor, para reconstruir o vínculo no webhook. Eventos não aplicáveis devem
> virar `"ignored"` (não lance erro — webhooks não devem responder 5xx à toa).

### 2. Registrar no seletor
`core/modules/billing/infra/factories/make-payment-gateway.ts`:

```ts
export const makePaymentGateway = (): PaymentGateway => {
  const provider = (process.env.PAYMENT_GATEWAY ?? "stripe").toLowerCase();
  switch (provider) {
    case "stripe":
      return new StripePaymentGateway({ /* env Stripe */ });
    case "pagarme":
      return new PagarMePaymentGateway({ /* env Pagar.me */ });
    default:
      throw new Error(`Gateway de pagamento não suportado: ${provider}`);
  }
};
```

### 3. Variáveis de ambiente
Defina as credenciais do provedor no `.env` e selecione com
`PAYMENT_GATEWAY=pagarme`. Documente-as em
[variáveis de ambiente](03-variaveis-de-ambiente.md).

### 4. Webhook
Aponte o webhook do provedor para `POST /api/stripe/webhook` (o handler é
genérico) **ou** crie um path equivalente que chame `makeHandleBillingWebhook()`.
A validação de assinatura é responsabilidade do adapter (`parseWebhookEvent`).

### 5. Pronto
Nada acima muda: nem casos de uso, nem actions, nem UI. O `SubscriptionRepository`
(Drizzle) continua persistindo plano/IDs no usuário.

## O que **não** fazer

- Não acoplar tipos do SDK do provedor fora de `infra/gateways/`.
- Não tratar o payload bruto do provedor nos casos de uso — converta sempre para
  `BillingEvent`.
- Não redirecionar no cliente com SDK específico (ex.: `stripe.redirectToCheckout`);
  use a `checkoutUrl` devolvida.
