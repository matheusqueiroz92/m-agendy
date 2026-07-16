# Auditoria de prontidão para produção — M.Agendy

Data: 15/07/2026

> **Atualização (16/07/2026):** os itens de código das Fases 0–2 do plano
> abaixo foram implementados (trial sem cartão, correção do `/subscription`,
> cancelamento real de lembretes no QStash, páginas legais, correções de UX).
> Detalhes e o que ainda depende de credenciais externas estão no fim deste
> documento, na seção "Status da implementação".

Comparação entre o que a landing page promete e o que o código (`src/`) efetivamente entrega, com plano de implementação priorizado para lançar e monetizar.

## Resumo

A base de código está muito mais madura do que uma landing page normalmente sugere: arquitetura em camadas (`src/core/modules/*` — domain/application/infra), testes unitários por caso de uso, multi-tenant por clínica, RBAC, catálogo de planos centralizado, integração real com Meta Cloud API e Stripe (não são mocks). O gap principal não é "falta construir a feature", é **três lacunas de configuração/produto que impedem monetizar de verdade** e alguns bugs de UI pontuais.

## O que está implementado e funcional

| Promessa da landing | Onde está | Status |
|---|---|---|
| Agendamento online pelo paciente | `src/app/agendar/[clinicId]`, `book-appointment` (use case + action) | ✅ Completo, com checagem de limite do plano |
| Chatbot de WhatsApp (agendar, confirmar) | `api/whatsapp/webhook`, `core/modules/scheduling/.../chatbot` | ✅ Completo — assinatura Meta validada, multi-tenant por `whatsappPhoneNumberId` |
| Lembretes automáticos | `api/reminders/dispatch`, `qstash-reminder-scheduler.ts`, `reminder-policy.ts` | ✅ Lógica completa, mas **não roda em produção sem `QSTASH_TOKEN`** (ver gaps) |
| Prontuário eletrônico (histórico, antecedentes, diagnósticos, prescrições, acompanhamento) | `core/modules/medical-records/*`, telas em `medical-records/[patientId]` | ✅ Completo, com log de acesso (`log-medical-record-access`) |
| Agenda por profissional/especialidade | `doctorsTable`, `upsert-doctor` | ✅ Completo |
| Multi-clínica / gestão de plataforma | `(platform)/platform`, admin actions | ✅ Completo — bloqueio, cortesia de plano, exclusão |
| Assinatura via Stripe (3 planos) | `/new-subscription`, `create-stripe-checkout`, `stripe-payment-gateway.ts` | ✅ Fluxo de compra completo para os 3 planos |
| Limites por plano (profissionais, agendamentos/mês, métricas, IA) | `billing/domain/entitlements.ts` | ✅ Aplicado em todos os pontos de criação |
| Dashboard com relatórios | `(protected)/dashboard/_components/*` | ✅ Implementado |
| Formulário de contato | `api/contact/route.ts` (nodemailer) | ✅ Funcional (depende de SMTP configurado) |
| Autenticação (e-mail/senha, Google) | BetterAuth (`src/lib/auth.ts`) | ✅ Implementado |

## Gaps que bloqueiam monetização (prioridade alta)

### 1. Teste grátis sem cartão não existe

A FAQ promete "Essential 7 dias grátis, Premium 14 dias grátis, sem cadastrar cartão". No código:
- `usersTable.plan` só é preenchido pelo webhook do Stripe (`subscription_activated`) ou por cortesia manual do admin (`/platform/clinics`).
- `resolveClinicAccess` (`clinics/domain/clinic-access.ts`) não tem nenhum conceito de trial automático — sem plano pago ou cortesia, o usuário fica sem acesso.
- O checkout da Stripe (`stripe-payment-gateway.ts`) não define `subscription_data.trial_period_days`, então mesmo pagando na Stripe não haveria período grátis.
- O enum `"trial"` existe em `userPlanEnum` (`db/schema.ts`) mas não é usado em lugar nenhum.

**Efeito prático:** hoje, todo usuário novo cai em `/new-subscription` e precisa inserir cartão e pagar imediatamente — contradiz a promessa central da landing e da FAQ. Isso é o maior risco de credibilidade/conversão no lançamento.

### 2. Página de gestão de assinatura (`/subscription`) trava no plano Premium

`src/app/(protected)/subscription/page.tsx` está *hardcoded*:
```
active={session.user.plan === "premium"}
planId="premium"
```
Um assinante Essential ou Gold que acessa "Assinatura" no painel vê o cartão do Premium e o botão "Fazer Assinatura" em vez de "Gerenciar Assinatura" — mesmo já pagando. `/new-subscription` (primeira contratação) está correto e oferece os 3 planos.

### 3. Variáveis de produção ausentes (WhatsApp, lembretes, planos)

No `.env` atual faltam:
- `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_API_URL` — sem elas, o chatbot e os lembretes rodam em **modo dev** (só logam no console, não enviam mensagem real).
- `QSTASH_TOKEN`, `REMINDER_DISPATCH_URL` — sem elas, nenhum lembrete é de fato agendado. É a funcionalidade mais citada na landing ("reduz até 40% das faltas") e hoje não dispara nada em produção.
- `STRIPE_ESSENTIAL_PLAN_PRICE_ID`, `STRIPE_GOLD_PLAN_PRICE_ID` — só existe `STRIPE_PREMIUM_PLAN_PRICE_ID`. Sem os outros dois, o checkout dos planos Essential e Gold falha com erro (`create-checkout-session.ts` bloqueia com "plano não disponível para contratação online").

Isso é 100% configuração (contas Meta Business + Upstash + Stripe), não é código novo — mas sem isso nada do "reduz faltas" e nenhum plano além do Premium pode ser vendido.

## Gaps secundários (bugs e conteúdo faltante)

| Item | Onde | Problema |
|---|---|---|
| Botão "Falar com consultor" | `hero-section.tsx` → `href="/whatsapp"` | Rota não existe (só existe `/api/whatsapp`, que é o webhook, não uma página). Leva a 404. |
| Botão "Falar com especialista" | `contact-section.tsx` | `CtaButton` sem `href` nem `onClick` — botão morto. |
| Política de Privacidade / Termos de Uso | busca em `src/app` não encontrou nenhuma página | A landing e a FAQ afirmam conformidade com a LGPD, mas não há página pública de política de privacidade/termos — obrigatório para um SaaS que trata dado de saúde (dado sensível pela LGPD) antes de cobrar de clientes reais. |
| `StepsSection` ("Como funciona") | `steps-section.tsx` | Componente vazio (só título), mas não está sendo usado na página atual — não é um bug visível, é código morto a limpar ou implementar se for reativado. |
| Cancelamento de lembretes no QStash | `qstash-reminder-scheduler.ts` método `cancelForAppointment` | É *no-op* (só loga). Se uma consulta for cancelada/remarcada depois que o lembrete já foi agendado no QStash, o lembrete antigo dispara mesmo assim. Precisa persistir o `messageId` do QStash para poder cancelar de verdade. |

## Plano de implementação priorizado

### Fase 0 — Bloqueadores de monetização (antes de abrir para pagantes)

1. **Implementar trial sem cartão.**
   - Adicionar `trialEndsAt` (timestamp) em `usersTable` ou em `clinicsTable`.
   - No `createClinic` (ou no signup), setar `plan = 'trial'` e `trialEndsAt = now + 7|14 dias` conforme o plano escolhido em `/new-subscription` (permitir "começar grátis" sem ir para a Stripe).
   - Atualizar `resolveClinicAccess` para tratar `trial` com `trialEndsAt` no futuro como `hasActivePlan = true`, e expirado como `hasActivePlan = false` (redireciona para `/new-subscription` para virar pagante).
   - Job diário (ou checagem lazy na sessão) para expirar trials vencidos.
2. **Corrigir `/subscription` para refletir o plano real** do usuário (essential/premium/gold), reaproveitando os mesmos cards de `/new-subscription` com `active` calculado a partir de `session.user.plan`.
3. **Configurar as integrações reais antes do go-live:**
   - Meta Cloud API: criar app WhatsApp Business, obter `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, configurar `WHATSAPP_VERIFY_TOKEN` e `WHATSAPP_APP_SECRET` no webhook da Meta.
   - Upstash QStash: criar conta, obter `QSTASH_TOKEN`, apontar `REMINDER_DISPATCH_URL` para `https://SEU_DOMINIO/api/reminders/dispatch`.
   - Stripe: criar os produtos/preços de Essential e Gold, preencher `STRIPE_ESSENTIAL_PLAN_PRICE_ID` e `STRIPE_GOLD_PLAN_PRICE_ID`, configurar o webhook de produção e o Customer Portal (`NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL`).
   - Validar de ponta a ponta em ambiente de staging: cadastro → confirmação por WhatsApp real → lembrete real → checkout de cada plano → cancelamento pelo portal.

### Fase 1 — Compliance e confiança (obrigatório para operar com dados de saúde)

4. Criar páginas **Política de Privacidade** e **Termos de Uso** (a LGPD trata dado de saúde como dado sensível — exige base legal clara, DPO/contato de encarregado e informações de retenção). Linkar no rodapé e no checkout.
5. Revisar se há criptografia/controle de acesso adequado nos campos sensíveis do prontuário (hoje texto plano no Postgres) — pelo menos garantir TLS no `DATABASE_URL`, backups criptografados no provedor, e reforçar que `log-medical-record-access` está sendo chamado em todo acesso de leitura, não só escrita.

### Fase 2 — Correções de UX/conteúdo (rápidas, baixo risco)

6. Criar a página `/whatsapp` (ou trocar o link do hero para `wa.me/<numero>` direto) para o botão "Falar com consultor" não dar 404.
7. Adicionar `href`/ação real ao botão "Falar com especialista" da seção de contato (ex.: link `https://wa.me/5577981257722`).
8. Implementar cancelamento real de lembretes no QStash (`DELETE /v2/messages/{id}`) guardando o `messageId` retornado no `schedule()` — evita lembrete de consulta já cancelada.
9. Decidir sobre `StepsSection`: implementar o "Como funciona" (hoje só o título) ou remover o arquivo morto.

### Fase 3 — Antes do lançamento (checklist operacional)

10. Rodar `npm run test` (suíte já existe e é ampla) e `npm run build` limpos em produção.
11. Confirmar `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL` e `APP_URL` apontando para o domínio final (afetam redirect de login, links de agendamento público e o `successUrl`/`cancelUrl` do Stripe).
12. Definir e testar o fluxo de e-mail transacional (verificação de conta, redefinição de senha) além do formulário de contato — usam o mesmo SMTP.
13. Monitoramento básico: logs de erro do webhook do WhatsApp e da Stripe (hoje só `console.error`) — considerar Sentry ou similar antes de ter clientes reais pagando.

## Status da implementação (16/07/2026)

Implementado nesta rodada, seguindo domínio → aplicação → infra → entrega
(ver `docs/05-desenvolvimento.md`):

- **Trial sem cartão** (Fase 0.1): `users.plan_expires_at` + `users.has_used_trial`
  (migração `drizzle/manual/apply-fase-9-trial-e-lembretes.sql`), `trialDays`
  no catálogo de planos, `StartTrialUseCase` + testes, `DrizzleTrialRepository`,
  action `start-trial`, botão "Começar grátis por N dias" em `/new-subscription`.
  `resolveClinicAccess` agora expira o plano base (não só o override); guard
  novo em `(protected)/layout.tsx` derruba o acesso quando o plano (inclui
  trial) expira.
- **`/subscription` corrigido** (Fase 0.2): mostra o plano real do assinante
  (essential/premium/gold), não mais um card fixo de Premium; trata o caso de
  trial ativo (botão leva ao checkout, não ao portal — ainda não existe
  assinatura na Stripe nesse estágio).
- **Cancelamento real de lembretes no QStash** (Fase 2.8): nova tabela
  `appointment_reminders` guarda o `messageId` de cada lembrete agendado;
  `cancelForAppointment` agora faz `DELETE` de verdade na API do QStash, em
  vez de no-op.
- **Páginas legais** (Fase 1.4): `/terms`, `/privacy`, `/cookies`, `/lgpd`
  criadas (já eram linkadas pelo rodapé). Conteúdo é um ponto de partida
  sério, mas **precisa de revisão jurídica** antes do lançamento comercial —
  há placeholders explícitos para razão social/CNPJ/DPO.
- **Correções de UX** (Fase 2.6/2.7/2.9): link do hero "Falar com consultor"
  e botão "Falar com especialista" agora abrem o WhatsApp de verdade
  (`wa.me`, número centralizado em `src/lib/contact.ts`); `steps-section.tsx`
  (código morto, não usado) removido.

**Não implementado nesta rodada** (fora do alcance de código):

- Fase 0.3 — configurar credenciais reais de produção (Meta WhatsApp Cloud
  API, Upstash QStash, price IDs Essential/Gold na Stripe). Isso depende de
  contas de negócio que só o time do M.Agendy pode criar.
- Fase 3 (checklist operacional) — rodar a suíte de testes/build no ambiente
  real de deploy (o sandbox usado nesta sessão tinha um `node_modules`
  instalado para Windows, incompatível com o Linux do sandbox, então não foi
  possível rodar `npm run test`/`npm run build` aqui — ver nota abaixo),
  monitoramento (Sentry ou similar), teste do fluxo de e-mail transacional em
  produção.

**Nota sobre verificação automática:** a suíte de testes (`vitest`) e o
`tsc`/build não puderam ser executados dentro do sandbox desta sessão — o
`node_modules` já presente no projeto foi instalado no Windows do usuário e
tem binários nativos (esbuild, rollup) incompatíveis com o Linux do sandbox.
Todo o código novo foi revisado manualmente arquivo a arquivo. Recomenda-se
rodar `npm run test` e `npm run build` localmente antes de fazer deploy.

## Observação final

Nenhum destes itens exige reescrever arquitetura — o desenho em camadas (domain/application/infra) já isola bem cada gap (ex.: trial é uma regra de domínio pura em `clinic-access.ts`, plug de mensageria já é intercambiável). O esforço real está concentrado em: (a) uma pequena regra de trial + expiração, (b) configurar três integrações externas com credenciais de produção, e (c) duas páginas de conteúdo legal. Isso é days, não semanas, de trabalho de engenharia — o gargalo maior tende a ser burocrático (criar conta Business da Meta, aprovar número de WhatsApp, redigir a política de privacidade).
