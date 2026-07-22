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
| `/platform/whatsapp-requests` | Fila de solicitações de integração de número próprio de WhatsApp (ver [docs/11](11-plano-notificacoes-whatsapp.md)). |

### Gestão de clínicas (`/platform/clinics`)

Cada linha tem um menu de ações:

- **Editar** — nome e tipo da clínica.
- **Plano** — concede um plano de cortesia/desconto (override), com expiração
  opcional, ou volta a usar a assinatura do responsável.
- **Bloquear / Liberar** — suspende ou reativa o acesso da clínica.
- **Excluir** — remove a clínica e seus dados vinculados.
- **Nova clínica** — cadastra a clínica e a pessoa responsável por ela.

Todas as ações exigem `platform_admin` (garantido no caso de uso, não só na UI)
e geram trilha de auditoria.

### Responsável ao criar uma clínica pelo admin

Diferente do autocadastro público (onde quem se cadastra já vira o dono da
própria clínica), uma clínica criada pelo admin não tem, por padrão, nenhum
usuário vinculado — e sem isso ninguém consegue logar nela. Por isso, ao criar
(não ao editar), o formulário também pede **nome e e-mail do responsável**
(telefone é opcional):

1. Se já existe uma conta com aquele e-mail (a pessoa já usa o M.Agendy em
   outra clínica), ela é apenas **vinculada** como responsável — sem criar
   conta duplicada nem enviar e-mail.
2. Senão, uma conta nova é criada (via `auth.api.createUser`, plugin `admin`
   do BetterAuth) com uma senha aleatória descartável que **ninguém vê** —
   nem o admin — e o e-mail de "definir senha" é disparado na hora,
   reaproveitando o mesmo fluxo de recuperação de senha do login
   (`sendResetPassword`). A pessoa define a própria senha pelo link e já cai
   direto na clínica dela. A conta já nasce com `emailVerified: true` (ver
   nota abaixo) — clicar nesse link já prova posse do e-mail, então não há
   um segundo e-mail de verificação no primeiro login.
3. Se esse provisionamento falhar por qualquer motivo, a clínica recém-criada
   é revertida (excluída) em vez de ficar um registro órfão/inacessível.

Implementação: `ClinicOwnerProvisioner` (porta) /
`DrizzleClinicOwnerProvisioner` (adapter), orquestrado pelo
`UpsertClinicUseCase` — ver `docs/05-desenvolvimento.md` para o padrão
geral de portas/casos de uso do projeto.

> **Nota sobre o schema:** `auth.api.createUser` (usado aqui) é exposto pelo
> plugin `admin` do BetterAuth (`better-auth/plugins`), que exige as colunas
> `role`, `banned`, `ban_reason` e `ban_expires` em `users` — mesmo que a
> aplicação não use RBAC nativo do BetterAuth (o RBAC próprio é
> `platformRole`, um conceito separado). Sem essas colunas, a criação de
> clínica falha em runtime com `BetterAuthError: The field "role" does not
> exist...`. Já aplicado em `src/db/schema.ts` e em
> `drizzle/manual/apply-admin-plugin-fields.sql`.

### Correções do onboarding pelo admin ✅ implementadas (22/07/2026)

Encontradas testando o fluxo completo (criar clínica → responsável redefine
senha → login):

- **`session.user.phoneNumber` sempre vazio, mesmo com o telefone salvo no
  banco** — `customSession` (`src/lib/auth.ts`) espalhava o objeto `user` do
  próprio BetterAuth (que só carrega os campos declarados em
  `user.additionalFields` — `phoneNumber` não estava lá) em vez do resultado
  da consulta Drizzle direta que a mesma função já fazia (`userData`, que
  tinha o telefone). Corrigido: `phoneNumber` adicionado a
  `additionalFields` e mesclado explicitamente no retorno da sessão.
- **E-mail de verificação redundante e fora de ordem** — como
  `requireEmailVerification: true` está ativo globalmente e a conta nasce
  com `emailVerified: false`, o primeiro login do responsável (depois de já
  ter redefinido a senha) disparava um SEGUNDO e-mail, de verificação. Como
  clicar no link de redefinir senha já prova o acesso à caixa de entrada,
  `DrizzleClinicOwnerProvisioner.provision()` agora marca
  `emailVerified: true` na criação da conta — só 1 e-mail, sem etapa
  duplicada.
- **Link de verificação de e-mail caía na landing page em vez do
  dashboard** — todo e-mail de verificação disparado pelo app embute
  `callbackURL=/` (nenhum dos pontos de disparo do BetterAuth usados aqui
  informa um `callbackURL` próprio), e a página `/verify-email` fazia sua
  própria checagem via `fetch()` (sem repassar esse parâmetro) seguida de um
  `router.push` manual — nunca deixando o BetterAuth completar o próprio
  fluxo de criar sessão + redirecionar. Corrigido: a página agora navega a
  página inteira para `/api/auth/verify-email?token=...&callbackURL=/entrar`,
  deixando o BetterAuth validar o token, criar a sessão e redirecionar de
  verdade — `/entrar` já é o roteador pós-login que manda para
  `/dashboard`.

Na mesma leva, a fila `/platform/whatsapp-requests` passou a exibir o
telefone do responsável (mesmo coletado aqui na criação) — ver
[docs/11-plano-notificacoes-whatsapp.md](11-plano-notificacoes-whatsapp.md).

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

| Plano | Profissionais | Agendamentos/mês | Agendamentos/dia | Métricas detalhadas | IA | WhatsApp próprio |
|---|---|---|---|---|---|---|
| Essential | 3 | 100 | 15 | não | não | não |
| Premium | 10 | ilimitado | 40 | sim | não | sim |
| Gold | ilimitado | ilimitado | ilimitado | sim | sim | sim |

Onde é aplicado:

- **Limite de profissionais** — `UpsertProfessionalUseCase` bloqueia a criação
  acima do limite (`PlanLimitError`).
- **Limite de agendamentos/mês** — aplicado em **todos os caminhos** de criação:
  painel (`UpsertAppointmentUseCase`), link público (`BookAppointmentUseCase`) e
  chatbot (`ScheduleAppointmentUseCase`). Nos fluxos sem sessão, o plano efetivo
  da clínica é resolvido pela porta `ClinicPlanProvider`. É um limite de
  **capacidade de agenda** por mês (conta pela data agendada).
- **Limite de agendamentos/dia** — aplicado nos mesmos 3 caminhos, mas conta
  pela data de **criação** do agendamento (`createdAt`), não pela data
  agendada — é um limite de **volume de mensagens de WhatsApp** disparadas
  (cada agendamento criado gera uma confirmação + lembretes), independente do
  limite mensal. Quando falta exatamente 1 agendamento para o limite, a
  clínica recebe um aviso in-app (`ClinicNotifier.notifyDailyLimitWarning`)
  antes de o próximo ser efetivamente bloqueado. Editar um agendamento
  existente não conta contra nenhum dos dois limites (só a criação).
- **Métricas detalhadas / IA** — o dashboard usa `planHasFeature(...)` para
  exibir gráficos/rankings só para quem tem direito; os demais veem um aviso de
  upgrade.
- **Número de WhatsApp próprio** (`canUseOwnWhatsAppNumber`) — Essential só usa
  o número compartilhado da plataforma; Premium/Gold podem **solicitar** a
  integração do próprio número (ver [docs/11](11-plano-notificacoes-whatsapp.md)
  para o fluxo completo).

Helpers puros em `billing/domain/entitlements.ts`: `canAddProfessional`,
`canCreateAppointment`, `canCreateAppointmentToday`,
`isOneAppointmentAwayFromDailyLimit`, `planHasFeature`, `entitlementsOf`.
Ajuste limites/recursos editando o catálogo — a verificação acompanha.

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
    maxAppointmentsPerDay: 15,     // número ou null (ilimitado) — volume de WhatsApp/dia
    detailedMetrics: false,        // gráficos/rankings no dashboard
    aiInsights: false,             // recurso de IA
    canUseOwnWhatsAppNumber: false, // pode solicitar número de WhatsApp próprio
  },
}
```

Editar esses valores basta — a aplicação inteira acompanha, porque os pontos de
checagem leem daqui:

- profissionais → `UpsertProfessionalUseCase` (via `canAddProfessional`);
- agendamentos/mês → use cases de painel, público e chatbot (via `canCreateAppointment`);
- agendamentos/dia → os mesmos 3 use cases (via `canCreateAppointmentToday` e
  `isOneAppointmentAwayFromDailyLimit`);
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
