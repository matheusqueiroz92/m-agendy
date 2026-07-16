# Administração da plataforma e gestão de planos

Esta área é exclusiva do **admin de plataforma** (operador do SaaS) e é
totalmente separada do painel das clínicas: menu, layout e opções próprios.

## Separação das áreas

- **Admin de plataforma** (`platform_role = 'platform_admin'`): ao logar é levado
  para **`/platform`**, com sidebar e painel próprios. Não vê o painel de clínica.
- **Clínica/consultório** (equipe): usa o painel em `/dashboard`, `/patients`,
  `/medical-records`, etc. Nunca vê a área da plataforma.

A decisão de destino acontece em `resolveLandingRoute` (iam) e é reforçada nos
layouts: o layout protegido manda admin para `/platform`; o layout de
`/platform` barra quem não é admin.

## Área `/platform`

| Rota | Função |
|---|---|
| `/platform` | Visão geral: total de clínicas, bloqueadas, pacientes e consultas. |
| `/platform/clinics` | Gestão das clínicas: criar, editar, bloquear/liberar, plano, excluir. |

### Gestão de clínicas (`/platform/clinics`)

Cada linha tem um menu de ações:

- **Editar** — nome e tipo da clínica.
- **Plano** — concede um plano de cortesia/desconto (override), com expiração
  opcional, ou volta a usar a assinatura do responsável.
- **Bloquear / Liberar** — suspende ou reativa o acesso da clínica.
- **Excluir** — remove a clínica e seus dados vinculados.
- **Nova clínica** — cadastra uma clínica avulsa.

Todas as ações exigem `platform_admin` (garantido no caso de uso, não só na UI)
e geram trilha de auditoria.

## Bloqueio de acesso

Bloquear uma clínica define `status = 'blocked'` (com motivo opcional). Efeito:
os usuários da clínica conseguem **logar**, mas são levados à tela
**`/clinic-suspended`** (com o motivo e botão de encerrar sessão) e não acessam
nenhuma funcionalidade. Liberar volta o `status` para `active`.

O bloqueio tem **precedência** no redirecionamento pós-login (antes de qualquer
regra de plano), para que a clínica nunca fique presa na tela de assinatura.

## Planos — catálogo central

O **único lugar** para gerir planos é o catálogo:
`src/core/modules/billing/domain/plans.ts`.

```ts
export const PLAN_CATALOG = [
  { id: "essential", label: "Essential", monthlyPriceInBRL: 39, stripePriceEnv: "STRIPE_ESSENTIAL_PLAN_PRICE_ID" },
  { id: "premium",   label: "Premium",   monthlyPriceInBRL: 59, stripePriceEnv: "STRIPE_PREMIUM_PLAN_PRICE_ID" },
  { id: "gold",      label: "Gold",      monthlyPriceInBRL: 99, stripePriceEnv: "STRIPE_GOLD_PLAN_PRICE_ID" },
] as const;
```

- `id` é o valor salvo no banco (`users.plan` e `clinics.plan_override`).
- `label` é o nome exibido.
- `stripePriceEnv` é o nome da env com o price ID na Stripe (planos pagos).

### Oferecer um plano gratuitamente (cortesia)

Não exige código. Em **`/platform/clinics`** → menu da clínica → **Plano** →
escolha o plano (ex.: **Gold**) → defina a expiração se quiser → **Salvar**.

Isso grava um **override de plano na clínica**, que tem precedência sobre a
assinatura do gateway e libera o acesso de todos os usuários dela — sem depender
do Stripe. Para encerrar a cortesia, escolha "Nenhum (usar assinatura)".

### Criar um novo plano

Adicione uma entrada ao `PLAN_CATALOG`:

```ts
{
  id: "platinum",
  label: "Platinum",
  description: "Recursos avançados e suporte dedicado.",
  monthlyPriceInBRL: 149,
  stripePriceEnv: "STRIPE_PLATINUM_PLAN_PRICE_ID",
}
```

Pronto: o tipo `PlanId`, as validações e o seletor de cortesia da administração
passam a reconhecer o novo plano automaticamente. Para concedê-lo grátis/desconto,
use o mesmo fluxo de cortesia acima.

### Como o "plano efetivo" é calculado

Função pura `resolveClinicAccess` (`clinics/domain/clinic-access.ts`):

```
clínica bloqueada            → sem acesso, sem plano
override válido (não expirou) → vale o override (cortesia)
sem override                 → vale o plano da assinatura do responsável
```

A sessão expõe esse plano efetivo em `session.user.plan`, então o painel
desbloqueia automaticamente quando há cortesia — sem mexer em cada página.

## Recursos por plano (gating)

Cada plano declara seus **entitlements** no catálogo (`entitlements`):

| Plano | Profissionais | Agendamentos/mês | Métricas detalhadas | IA |
|---|---|---|---|---|
| Essential | 3 | 100 | não | não |
| Premium | 10 | ilimitado | sim | não |
| Gold | ilimitado | ilimitado | sim | sim |

Onde é aplicado:

- **Limite de profissionais** — `UpsertProfessionalUseCase` bloqueia a criação
  acima do limite (`PlanLimitError`).
- **Limite de agendamentos/mês** — aplicado em **todos os caminhos** de criação:
  painel (`UpsertAppointmentUseCase`), link público (`BookAppointmentUseCase`) e
  chatbot (`ScheduleAppointmentUseCase`). Nos fluxos sem sessão, o plano efetivo
  da clínica é resolvido pela porta `ClinicPlanProvider`.
- **Métricas detalhadas / IA** — o dashboard usa `planHasFeature(...)` para
  exibir gráficos/rankings só para quem tem direito; os demais veem um aviso de
  upgrade.

Helpers puros em `billing/domain/entitlements.ts`: `canAddProfessional`,
`canCreateAppointment`, `planHasFeature`, `entitlementsOf`. Ajuste limites/recursos
editando o catálogo — a verificação acompanha.

> O plano efetivo usado nos limites vem da sessão (`session.user.plan`), que já
> considera cortesia/override.

### Onde alterar os recursos de cada plano

Tudo num lugar só: **`src/core/modules/billing/domain/plans.ts`**, no campo
`entitlements` de cada plano.

```ts
{
  id: "essential",
  label: "Essential",
  // ...
  entitlements: {
    maxProfessionals: 3,           // número ou null (ilimitado)
    maxAppointmentsPerMonth: 100,  // número ou null (ilimitado)
    detailedMetrics: false,        // gráficos/rankings no dashboard
    aiInsights: false,             // recurso de IA
  },
}
```

Editar esses valores basta — a aplicação inteira acompanha, porque os pontos de
checagem leem daqui:

- profissionais → `UpsertProfessionalUseCase` (via `canAddProfessional`);
- agendamentos/mês → use cases de painel, público e chatbot (via `canCreateAppointment`);
- métricas/IA → dashboard (via `planHasFeature`).

**Adicionar um novo tipo de recurso** (ex.: `whatsappChatbot: boolean`):
1. adicione o campo na interface `PlanEntitlements` (mesmo arquivo) e preencha em
   cada plano;
2. use `entitlementsOf(plan).whatsappChatbot` — ou crie um helper em
   `billing/domain/entitlements.ts` — no ponto que quer barrar.

Mapa mental: **`plans.ts`** = o que cada plano é/libera; **`entitlements.ts`** =
as funções que respondem "pode?" (`canAddProfessional`, `canCreateAppointment`,
`planHasFeature`, `entitlementsOf`); os **use cases** chamam essas funções.

## Teste grátis sem cartão (trial)

Planos com `trialDays` no catálogo (hoje Essential = 7, Premium = 14; Gold não
tem, é vendido por consultor) podem ser iniciados sem passar pela Stripe:

- Caso de uso: `StartTrialUseCase` (`billing/application/use-cases/start-trial.ts`),
  chamado pela action `src/actions/start-trial`. Grava `users.plan` +
  `users.plan_expires_at` direto, e marca `users.has_used_trial = true` (o
  trial só pode ser usado uma vez por conta, mesmo depois de expirar).
- `resolveClinicAccess` (`clinics/domain/clinic-access.ts`) trata `basePlan`
  como inativo quando `basePlanExpiresAt` já passou — é isso que faz o acesso
  cair automaticamente quando o trial vence, sem job/cron algum: a checagem
  acontece na sessão (`auth.ts`) a cada request.
- Ao virar pagante (webhook da Stripe ativa a assinatura), `planExpiresAt` é
  zerado (`DrizzleSubscriptionRepository.activate`), então o plano pago nunca
  expira "sozinho" por essa checagem.
- `(protected)/layout.tsx` redireciona para `/new-subscription` sempre que a
  clínica não tem plano ativo (inclusive trial vencido) — antes disso só o
  `/entrar` pós-login fazia esse roteamento; o guard no layout garante que o
  painel não fique acessível depois que o trial expira.

## Venda de planos pagos (Stripe, multiplano)

- Cada plano aponta para a env do seu price ID (`stripePriceEnv`).
- O checkout recebe o **plano escolhido** (cada card de `/new-subscription`
  envia seu `planId`); o gateway usa o price do plano e grava o plano no
  `metadata` da assinatura.
- O webhook lê o plano do `metadata` e o ativa — sem mapa reverso de preços.

Para um plano novo virar vendável: defina o price na Stripe, aponte a env
`stripePriceEnv` do plano e pronto. Cortesia/grátis continua não exigindo Stripe.
