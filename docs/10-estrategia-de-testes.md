# Estratégia de testes automatizados

Data: 16/07/2026

> **Atualização (16/07/2026):** as Fases 1–4 da priorização abaixo (CI básico,
> testes de integração dos repositórios críticos, testes de assinatura dos
> webhooks e E2E das jornadas centrais) foram implementadas, junto com Docker
> para deploy em cloud. Ver seção "Status da implementação" ao final.

## Diagnóstico atual

A afirmação de que "não há testes automatizados" não é totalmente exata, mas a
lacuna real é séria o suficiente para justificar o mesmo alarme. O que existe
hoje:

- **39 arquivos `*.spec.ts`**, todos em `src/core/modules/**`, rodando com
  Vitest (`npm run test`). Cobrem regras de domínio puras (ex.:
  `reminder-policy.spec.ts`, `clinic-access.spec.ts`) e casos de uso da camada
  de aplicação, usando fakes/repositórios em memória (`InMemory*`,
  `Fake*`) — nunca batem em banco, HTTP ou infraestrutura real.
- A qualidade desses testes é boa: cobrem regra de negócio, autorização por
  papel (`authorizer.spec.ts`), limites de plano (`book-appointment.spec.ts`)
  e erros de domínio (`AppointmentConflictError`, `PlanLimitError` etc.).
- `vitest.config.ts` restringe explicitamente o `include` a `src/**/*.spec.ts`
  — ou seja, a decisão de só testar domínio/aplicação foi deliberada (ver
  `docs/05-desenvolvimento.md`: "Evite testar infra com banco real").

O que **não existe, e é o problema real para ir a produção**:

| Camada | Situação |
|---|---|
| Testes de integração | **Zero.** Nenhum teste roda contra Postgres real, Drizzle, BetterAuth, Stripe ou Meta de verdade. Os ~34 adapters de infra (`drizzle-*-repository.ts`, `stripe-payment-gateway.ts`, `qstash-reminder-scheduler.ts`, `whatsapp-messenger.ts`) não têm nenhuma rede de segurança automatizada. |
| Testes de API/rotas | **Zero.** `api/whatsapp/webhook`, `api/stripe/webhook`, `api/reminders/dispatch`, `api/contact`, `api/upload` não são exercitados por nenhum teste — nem a validação de assinatura (`verifyMetaSignature` só é testada isoladamente como função pura, não no fluxo da rota). |
| Testes E2E | **Zero.** Nenhuma ferramenta de E2E instalada (sem Playwright/Cypress no `package.json`). As jornadas mais importantes do negócio (cadastro → trial → dashboard; agendamento público; checkout Stripe; WhatsApp) só são validadas manualmente. |
| CI | **Inexistente.** Não há `.github/workflows`; os testes só rodam se alguém lembrar de rodar `npm run test` localmente antes do merge. |
| Testes de componente/UI | **Zero.** Nenhuma lib de testing de React instalada; formulários com RHF+Zod (ex.: `upsert-doctor-form.tsx`, `booking-form.tsx`) não têm cobertura própria. |
| Entidades de domínio "ricas" | Parcial. `Appointment.create()` valida `priceInCents` (`InvalidAppointmentPriceError`) mas isso só é exercitado indiretamente pelos testes de caso de uso, nunca diretamente. O mesmo vale para `Patient`, `Professional`, `MedicalRecord`, `Diagnosis`, `Prescription`, `ClinicalAttendance`, `FollowUp`. |
| Casos de uso sem spec | `delete-clinic`, `list-clinics-admin`, `set-clinic-plan-override`, `set-clinic-status`, `upsert-clinic` (admin da plataforma) e `list-clinics` (iam) — justamente a área que bloqueia/libera clínicas e concede planos de cortesia. |

Resumindo: a **regra de negócio** está bem coberta; o que falta é a confiança de
que a regra de negócio continua valendo quando conectada ao banco real, ao
Stripe real, ao WhatsApp real e ao navegador real — exatamente o que dá
confiança para colocar em produção e cobrar por isso.

## Pirâmide de testes alvo

```
        E2E (Playwright)         ~8–12 jornadas críticas, rodam no CI antes do deploy
      Integração (Vitest + DB)   Todos os adapters de infra + rotas de API
   Unitário (Vitest, já existe)  Todo domínio/aplicação — expandir para 100% das regras
```

A base unitária já é sólida — o esforço principal é nas duas camadas de cima,
que hoje são inexistentes.

## Plano por camada

### 1. Unitário — fechar as lacunas (baixo esforço, mantém o padrão atual)

Sem ferramentas novas: só seguir exatamente o padrão já usado
(`describe`/`it`/`expect`, fakes em `application/testing/`).

**a) Casos de uso de administração da plataforma sem teste**
`upsert-clinic`, `delete-clinic`, `set-clinic-status`, `set-clinic-plan-override`,
`list-clinics-admin`, `list-clinics`. Já existe `InMemoryAdminClinicRepository`
em `clinics/application/testing/` (usado por `admin-clinic.spec.ts`) — é só
reaproveitar para os casos de uso que faltam. Prioridade alta: é a área que
controla acesso e planos de cortesia de todas as clínicas.

```ts
// set-clinic-status.spec.ts (exemplo do padrão a seguir)
describe("SetClinicStatusUseCase", () => {
  it("bloqueia a clínica com motivo e registra auditoria", async () => {
    const repo = new InMemoryAdminClinicRepository([{ id: "c1", status: "active" }]);
    const audit = new FakeAuditLog();
    const useCase = new SetClinicStatusUseCase(repo, audit);

    await useCase.execute({ actor: platformAdmin, clinicId: "c1", status: "blocked", reason: "Inadimplência" });

    expect(repo.findById("c1")?.status).toBe("blocked");
    expect(audit.entries[0].action).toBe("clinic.blocked");
  });

  it("rejeita quem não é platform_admin", async () => {
    await expect(
      useCase.execute({ actor: clinicOwner, clinicId: "c1", status: "blocked" }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
```

**b) Entidades de domínio ricas, testadas diretamente**
`Appointment`, `Patient`, `Professional`, `MedicalRecord`, `Diagnosis`,
`Prescription`, `FollowUp` — testar `create()` isoladamente (invariantes) em
vez de só via caso de uso. Esforço baixo, evita que uma regra de validação
pare de ser exercitada se um teste de caso de uso mudar.

```ts
// appointment.spec.ts
describe("Appointment.create", () => {
  it("rejeita preço zero ou negativo", () => {
    expect(() => Appointment.create({ ...base, priceInCents: 0 })).toThrow(InvalidAppointmentPriceError);
    expect(() => Appointment.create({ ...base, priceInCents: -100 })).toThrow(InvalidAppointmentPriceError);
  });

  it("rejeita preço não inteiro (centavos fracionados)", () => {
    expect(() => Appointment.create({ ...base, priceInCents: 100.5 })).toThrow(InvalidAppointmentPriceError);
  });
});
```

**Meta de cobertura:** 100% das regras de domínio/aplicação com pelo menos um
teste de caminho feliz e um de rejeição. Ativar `coverage` do Vitest
(`@vitest/coverage-v8`) com limiar mínimo em `application/` e `domain/` (ex.:
90% linhas) — hoje não há nenhum limiar configurado, então regressões de
cobertura passam despercebidas.

### 2. Integração — a lacuna mais crítica (esforço médio-alto, ferramentas novas)

Objetivo: validar que os *adapters* reais (Drizzle, Stripe, Meta, QStash) e as
rotas de API funcionam contra dependências reais (ou o mais realista possível),
sem repetir a regra de negócio (essa já está no unitário).

**a) Banco de dados efêmero para CI**
Como o Postgres é Neon, duas opções, em ordem de recomendação:
1. **Neon branching**: criar uma branch efêmera do banco por execução de CI
   (a API do Neon suporta isso; existe a GitHub Action oficial
   `neondatabase/create-branch-action`), roda as migrações
   (`drizzle-kit migrate`) e destrói a branch ao final.
2. **Postgres via `services:` do GitHub Actions** (container `postgres:16`)
   quando não se quer depender da API do Neon no CI — mais simples, menos fiel
   ao ambiente real (sem as particularidades do Neon, como connection pooling).

**b) Testes de repositório (Drizzle)**
Um teste por repositório, batendo no banco de teste de verdade — valida que a
query realmente funciona (join, filtro por `clinicId`, `onDelete: cascade`
etc.), coisa que nenhum fake consegue garantir.

```ts
// drizzle-appointment-repository.integration.spec.ts
describe("DrizzleAppointmentRepository (integração)", () => {
  beforeEach(async () => { await resetTestDatabase(); }); // trunca tabelas

  it("isola agendamentos por clínica", async () => {
    const repo = new DrizzleAppointmentRepository();
    await repo.save(Appointment.create({ clinicId: "c1", ... }));
    await repo.save(Appointment.create({ clinicId: "c2", ... }));

    const count = await repo.countByClinicInPeriod("c1", start, end);
    expect(count).toBe(1); // não vaza o agendamento da clínica 2
  });

  it("detecta conflito de horário do mesmo profissional", async () => { /* ... */ });
});
```

Prioridade: `drizzle-appointment-repository`, `drizzle-subscription-repository`
e `drizzle-trial-repository` (dinheiro e acesso), depois os de prontuário
(isolamento por clínica é a garantia de segurança mais importante do app).

**c) Testes de gateway externo (Stripe, WhatsApp, QStash)**
Sem chamar a API de verdade em todo teste (custo, flakiness). Estratégia:
- **Stripe**: usar o modo de teste da Stripe (chaves `sk_test_...`) só no CI de
  integração, validando `StripePaymentGateway.parseWebhookEvent` com payloads
  de exemplo reais gerados pela própria Stripe CLI (`stripe trigger
  invoice.paid`), garantindo que a assinatura HMAC e o mapeamento de evento
  continuam corretos quando a Stripe mudar o formato do payload.
- **WhatsApp/Meta**: sem sandbox oficial fácil de automatizar — testar
  `HttpWhatsAppMessenger` com um servidor HTTP fake local (`msw` ou um
  Express mínimo) simulando a Graph API, validando o formato exato do request.
- **QStash**: idem, mockar a API HTTP do Upstash localmente para validar o
  `schedule()`/`cancelForAppointment()` reais (o `DELETE` que acabamos de
  implementar é o tipo de código que só um teste de integração pega).

**d) Testes de rota de API (Route Handlers do Next.js)**
Chamar o handler diretamente (`import { POST } from "@/app/api/.../route"`)
com um `Request` real — não precisa de servidor rodando.

```ts
// whatsapp-webhook.integration.spec.ts
describe("POST /api/whatsapp/webhook", () => {
  it("rejeita payload com assinatura inválida", async () => {
    const req = new Request("http://localhost/api/whatsapp/webhook", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: { "x-hub-signature-256": "sha256=assinatura-errada" },
    });
    const res = await POST(req as NextRequest);
    expect(res.status).toBe(401);
  });

  it("confirma consulta quando paciente responde 'sim'", async () => {
    const req = buildSignedRequest({ from: "+5511999999999", text: "sim" });
    const res = await POST(req);
    expect(res.status).toBe(200);
    // consulta pendente do telefone deve virar "confirmed" no banco de teste
  });
});
```

Igual para `api/stripe/webhook` (assinatura Stripe inválida → rejeitado) e
`api/reminders/dispatch` (payload inválido → 422).

**Meta de cobertura:** todo adapter em `infra/persistence` e `infra/gateways`
com pelo menos 1 teste de integração; todas as 5 rotas de API com teste de
caminho feliz + rejeição de assinatura/payload inválido.

### 3. E2E — as jornadas que decidem se o cliente paga (esforço médio)

Ferramenta recomendada: **Playwright** (integra bem com Next.js, roda em CI
sem X server, tem trace viewer para depurar falhas). Cypress é alternativa
válida, mas Playwright tem melhor suporte a múltiplos navegadores e é mais
comum em projetos Next.js recentes.

Jornadas prioritárias (cobrem literalmente todo o funil de monetização):

1. **Cadastro → verificação de e-mail (mock) → criar clínica → iniciar trial → dashboard.**
2. **Login → `/dashboard` acessível; logout → `/dashboard` redireciona para `/auth`.**
3. **Agendamento público** (`/agendar/[clinicId]`): selecionar profissional, ver
   horários disponíveis, agendar, checar que o agendamento aparece no painel
   da clínica.
4. **Limite de plano**: clínica no plano Essential com 100 agendamentos no mês
   não consegue criar o 101º (mensagem de upgrade, não erro genérico).
5. **Checkout Stripe** (modo teste): assinar um plano, usar cartão de teste
   `4242 4242 4242 4242`, confirmar que `session.user.plan` muda após o
   webhook processar (pode exigir expor o webhook via túnel tipo `stripe
   listen --forward-to` no ambiente de CI, ou testar só a chamada de
   `create-checkout-session` e simular o webhook via requisição direta).
6. **Trial expira**: com o relógio do sistema adiantado (ou um usuário de
   teste com `plan_expires_at` no passado), acessar `/dashboard` e cair em
   `/new-subscription`.
7. **Prontuário eletrônico**: abrir prontuário de um paciente, adicionar
   diagnóstico + prescrição, conferir que aparece no histórico.
8. **Clínica bloqueada pela plataforma**: admin bloqueia via `/platform/clinics`,
   usuário da clínica loga e cai em `/clinic-suspended`.
9. **Isolamento multi-tenant**: usuário da clínica A não consegue ver/editar
   paciente da clínica B (tentar acessar URL direta).

```ts
// e2e/booking.spec.ts (Playwright, exemplo de estrutura)
test("paciente agenda consulta pelo link público", async ({ page }) => {
  await page.goto(`/agendar/${testClinicId}`);
  await page.getByLabel("Profissional").selectOption(testDoctorId);
  await page.getByRole("button", { name: /\d{2}:\d{2}/ }).first().click();
  await page.getByLabel("Nome").fill("Maria Teste");
  await page.getByLabel("Telefone").fill("11999999999");
  await page.getByRole("button", { name: "Confirmar agendamento" }).click();
  await expect(page.getByText("Consulta agendada")).toBeVisible();
});
```

**Meta de cobertura:** as 9 jornadas acima, não mais que isso no início — E2E
é caro de manter; cobertura ampla de UI fica para testes de componente depois,
se necessário.

### 4. Segurança — testes que não podem faltar antes de cobrar de clientes

- Assinatura do webhook do WhatsApp (`X-Hub-Signature-256`) e da Stripe
  (`stripe-signature`) rejeitadas quando inválidas ou ausentes (parte do item
  2d, mas vale destacar: hoje `WHATSAPP_APP_SECRET` ausente cai em "modo dev
  sem validação" — o teste de integração precisa garantir que em produção,
  com o secret configurado, a validação é *obrigatória* e não pode ser
  contornada).
- RBAC por rota: cada papel (`owner`, `manager`, `professional`, `staff`)
  tentando acessar cada área sensível (prontuário, configurações, admin da
  plataforma) — hoje `authorizer.spec.ts` testa a função pura, falta um teste
  de integração/E2E que confirme que a rota realmente aplica isso (ex.: staff
  logado tentando abrir `/medical-records/[id]` direto pela URL).
- Isolamento multi-tenant em todas as rotas que recebem um `id` na URL
  (paciente, agendamento, prontuário) — testar que um usuário da clínica A não
  consegue ler/editar um recurso da clínica B trocando o UUID na URL.

## Ferramentas a adicionar

| Ferramenta | Uso | Motivo |
|---|---|---|
| `@vitest/coverage-v8` | Cobertura + limiares no CI | Hoje não há nenhum número, então regressão de cobertura passa despercebida |
| `@playwright/test` | E2E | Padrão de mercado para Next.js, roda headless no CI |
| `msw` (Mock Service Worker) | Mockar Stripe/Meta/QStash nos testes de integração | Evita depender de rede externa real no CI (flaky, lento, custo) |
| Neon branching (ou Postgres via `services:` do GH Actions) | Banco efêmero para testes de integração | Testar os repositórios Drizzle contra Postgres de verdade |
| `stripe-cli` (só no workflow de CI, não como dependência do projeto) | Gerar eventos de webhook Stripe realistas | Validar `StripePaymentGateway` com payloads reais, não inventados à mão |

Nenhuma dessas ferramentas conflita com o padrão já estabelecido (Vitest
continua sendo o test runner de unidade e integração; só o E2E usa uma
ferramenta própria, como é normal).

## CI (GitHub Actions)

O repositório já está no GitHub (`matheusqueiroz92/m-agendy`) mas não tem
nenhum workflow. Proposta mínima (`\.github/workflows/ci.yml`):

```yaml
name: CI
on: [pull_request, push]
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run test -- --coverage

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: postgres }
        ports: ["5432:5432"]
        options: >-
          --health-cmd pg_isready --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npm run drizzle:migrate
        env: { DATABASE_URL: postgres://postgres:postgres@localhost:5432/postgres }
      - run: npm run test:integration
        env: { DATABASE_URL: postgres://postgres:postgres@localhost:5432/postgres }

  e2e:
    runs-on: ubuntu-latest
    needs: [unit, integration]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
```

`unit` e `integration` bloqueiam todo PR; `e2e` roda antes de qualquer deploy
para produção (pode rodar só em push para a branch principal, se o tempo de
execução for uma preocupação).

## Priorização (o que vale mais para o lançamento)

1. **CI básico rodando os 39 testes unitários já existentes** — zero código
   novo, só o workflow acima sem o job de integração/E2E. Isso sozinho já
   evita regressão silenciosa. Esforço: horas.
2. **Testes de integração dos repositórios de billing/trial e do
   isolamento multi-tenant** (agendamentos, pacientes, prontuário) — é onde um
   bug vira "cliente vendo dado de outra clínica" ou "cobrança errada".
   Esforço: dias.
3. **Testes de assinatura das rotas de webhook** (WhatsApp e Stripe) — é
   superfície de segurança exposta publicamente na internet. Esforço: 1 dia.
4. **E2E das jornadas 1–6** da lista acima (cadastro→trial→dashboard,
   agendamento público, checkout) — são o funil de monetização. Esforço:
   3–5 dias.
5. **Fechar lacunas unitárias** (casos de uso de admin, entidades de domínio) —
   importante, mas menor risco imediato porque a lógica já é exercitada
   indiretamente hoje. Esforço: 1–2 dias.
6. **E2E das jornadas 7–9** e testes de componente de formulários — podem vir
   depois do lançamento, como hardening contínuo.

Itens 1–3 são o mínimo defensável para cobrar de clientes reais; 4–6 são o que
transforma "defensável" em "confortável".

## Status da implementação (16/07/2026)

### CI (item 1)

`.github/workflows/ci.yml` com 4 jobs: `unit` (os 39+ testes existentes,
com cobertura), `integration` (Postgres via `services:`, schema aplicado com
`drizzle-kit push --force` — não depende do histórico de migrações, que hoje é
misto entre `drizzle/*.sql` gerado e SQL manual em `drizzle/manual/`),
`e2e` (build real + Playwright) e `docker-build` (valida que o `Dockerfile`
builda, sem publicar). Roda em todo PR e push para `main`.

### Testes de integração (item 2)

Infra nova: `vitest.integration.config.ts` (suíte separada, `*.integration.spec.ts`),
`vitest.integration.setup.ts` (recusa rodar sem `TEST_DATABASE_URL` — trava de
segurança contra truncar um banco real por engano), e helpers reutilizáveis em
`src/core/shared/infra/testing/` (`reset-test-database.ts`, `seed-test-data.ts`).

Cobertura escrita:
- `DrizzleAppointmentRepository`: isolamento de contagem por clínica, detecção
  de conflito de horário, exclusão do próprio agendamento ao editar, e
  preservação do status (`confirmed`) num upsert de edição.
- `DrizzleSubscriptionRepository` e `DrizzleTrialRepository`: ativação/
  desativação de assinatura, início de trial, e a regra de `planExpiresAt`
  ser limpo ao virar pagante.
- `UpsertClinicalAttendanceUseCase` composto com os adapters Drizzle reais
  (não fakes): prova, contra Postgres de verdade, que a fronteira de
  isolamento multi-tenant do prontuário eletrônico se sustenta de ponta a
  ponta — não só no teste unitário com repositório em memória.

### Testes de assinatura dos webhooks (item 3)

- `src/app/api/whatsapp/webhook/route.integration.spec.ts`: handshake `GET`
  (token certo/errado), `POST` com assinatura ausente/inválida (401) e o
  fluxo real de confirmação de consulta via `X-Hub-Signature-256` válida.
- `src/app/api/stripe/webhook/route.integration.spec.ts`: assinatura válida
  (evento não mapeado vira "ignored", sem chamar a API real da Stripe),
  assinatura com segredo errado, header ausente e corpo adulterado — todos
  400.
- **Correção encontrada ao escrever o teste:** `api/stripe/webhook/route.ts`
  não tinha `try/catch` — uma assinatura inválida derrubava a exceção do
  gateway sem tratamento e o Next.js devolvia 500 (a Stripe entenderia como
  falha nossa e reenviaria o evento indefinidamente). Corrigido para
  responder 400 de forma limpa.

### E2E com Playwright (item 4)

`playwright.config.ts` + `e2e/global-setup.ts` (semeia dados direto via
Drizzle, incluindo um hash de senha compatível com o BetterAuth via
`better-auth/crypto`, evitando depender do fluxo de verificação por e-mail
real nos testes). Specs escritos:

- `e2e/booking.spec.ts` — agendamento público de ponta a ponta (jornada mais
  importante do funil, sem autenticação).
- `e2e/auth.spec.ts` — login com assinatura ativa → `/dashboard`; logout →
  `/auth`; acesso sem sessão redireciona; credenciais inválidas mostram erro.
- `e2e/trial-expiration.spec.ts` — login com trial vencido cai em
  `/new-subscription`, inclusive tentando forçar `/dashboard` direto.

**Ressalva:** a interação com o `DatePicker` (calendário) em
`booking.spec.ts` é a parte mais sensível — não foi possível validar contra o
app rodando de verdade neste ambiente (ver nota "Sobre verificação" abaixo).
O resto dos seletores usa labels/roles estáveis do ShadCN.

### Docker

`Dockerfile` multi-stage (deps → builder → runner) usando `output: "standalone"`
do Next.js (adicionado em `next.config.ts`), `.dockerignore`, e
`docker-compose.yml` para subir app + Postgres localmente com um comando
(`npm run docker:up`). `.env.example` criado (não existia, embora já fosse
referenciado em `docs/02-instalacao.md`).

### Sobre verificação

Não foi possível rodar `npm run test`, `npm run test:integration`,
`npm run test:e2e` nem `docker build` de verdade neste ambiente: o
`node_modules` do projeto foi instalado no Windows do usuário e tem binários
nativos (esbuild, rollup) incompatíveis com o Linux do sandbox desta sessão, e
não há Postgres/navegador reais disponíveis aqui. Todo o código foi revisado
manualmente arquivo a arquivo, mas **rode a suíte completa localmente antes de
confiar nela em produção** — em especial `booking.spec.ts` (calendário) e o
`e2e/global-setup.ts` (hash de senha do BetterAuth), que são as partes com
maior chance de precisar de um ajuste fino na primeira execução real.

### Incidente (16/07/2026): `npm test` truncou o banco Neon real

Ao rodar `npm test` pela primeira vez localmente, os testes de integração
(`*.integration.spec.ts`) executaram junto com os de unidade. Causa raiz:
`vitest.config.ts` tinha `include: ["src/**/*.spec.ts"]`, e esse glob casa por
**sufixo** — `route.integration.spec.ts` também termina em `.spec.ts`. Como a
trava que aponta `DATABASE_URL` para `TEST_DATABASE_URL`
(`vitest.integration.setup.ts`) só é carregada por `vitest.integration.config.ts`,
os testes de integração rodaram contra o `DATABASE_URL` real do `.env`
(Neon) — e várias suítes chamam `resetTestDatabase()`, que faz
`TRUNCATE TABLE ... CASCADE` em 18 tabelas da aplicação entre casos. Rodar em
paralelo (sem a trava `fileParallelism: false` do config de integração) ainda
causou corridas entre arquivos, explicando os erros de FK observados.

**Correção aplicada:**
1. `vitest.config.ts` agora tem `exclude: [...configDefaults.exclude, "src/**/*.integration.spec.ts"]`
   explícito, além do `include`.
2. `resetTestDatabase()` (`src/core/shared/infra/testing/reset-test-database.ts`)
   ganhou uma trava em profundidade: recusa rodar o `TRUNCATE` a menos que
   `process.env.DATABASE_URL === process.env.TEST_DATABASE_URL`, mesmo que um
   config de teste errado volte a incluir os arquivos de integração no futuro.

**Se isso aconteceu com você**: as tabelas `users`, `clinics`,
`users_to_clinics`, `doctors`, `patients`, `appointments`,
`medical_records`/`clinical_attendances`/`diagnoses`/`prescriptions`/`follow_ups`,
`notifications`, `audit_logs`, `whatsapp_conversations`,
`appointment_reminders`, `sessions`, `accounts` e `verifications` foram
esvaziadas no banco apontado por `DATABASE_URL`. Verifique se o Neon tem
Point-in-Time Restore/branch de restauração disponível antes de recriar os
dados manualmente.
