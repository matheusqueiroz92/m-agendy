# Arquitetura (core) — Hexagonal + DDD

Este diretório (`src/core`) concentra a lógica de negócio do M.Agendy de forma
**independente de framework**. O objetivo é deixar as regras testáveis,
manuteníveis e portáveis — de modo que a escolha entre "API do Next.js" e uma
"API separada (Fastify)" se torne um detalhe de _delivery_, não uma decisão
arquitetural irreversível.

## Camadas

```
src/core/
├── shared/                     # blocos reutilizáveis entre módulos
│   ├── domain/                 # DomainError (base de todos os erros de regra)
│   ├── application/ports/      # portas genéricas (ex.: Clock)
│   └── infra/                  # adapters genéricos (ex.: SystemClock)
└── modules/
    └── scheduling/             # bounded context de agendamento (exemplo)
        ├── domain/             # entidades + invariantes + erros (PURO)
        ├── application/
        │   ├── ports/          # interfaces (repos, notificadores)
        │   ├── use-cases/      # casos de uso (orquestram o domínio)
        │   └── testing/        # fakes/in-memory para testes
        └── infra/
            ├── persistence/    # adapter Drizzle (implementa a porta de repo)
            ├── messaging/      # adapter WhatsApp (implementa a porta notifier)
            ├── scheduling/     # adapter QStash (implementa ReminderScheduler)
            └── factories/      # composition root (monta os use cases)
```

## Regra de dependência

As dependências apontam **para dentro**: `infra → application → domain`.

- **domain**: não importa nada de fora (nem Next, nem Drizzle, nem WhatsApp).
- **application**: depende só do domínio e de _interfaces_ (portas).
- **infra**: implementa as portas com tecnologia concreta (Drizzle, fetch, etc.).
- **delivery** (`src/actions/*`, `app/api/*`): casca fina que chama a factory.

## Fluxo de uma operação (exemplo: agendar consulta)

1. `src/actions/schedule-appointment` (Server Action) autentica e monta o input.
2. Chama `makeScheduleAppointment()` (factory) → devolve o use case montado.
3. `ScheduleAppointmentUseCase` aplica as regras (data futura, sem conflito),
   cria a entidade `Appointment`, salva via porta de repositório, dispara a
   confirmação via porta de mensageria e **agenda os lembretes** via porta
   `ReminderScheduler`.
4. As implementações concretas (`DrizzleAppointmentRepository`,
   `WhatsAppAppointmentNotifier`, `QStashReminderScheduler`) ficam isoladas em
   `infra`.

## Fluxo dos lembretes (trabalho agendado)

Esta é a peça que o Next.js serverless não cobre sozinho — resolvida com uma
porta de fila/agendador, sem reescrever a aplicação:

1. Ao agendar, o caso de uso calcula os horários dos lembretes com a política de
   domínio `computeReminderTimes` (padrão: 24h e 2h antes; descarta os que já
   passaram) e chama `ReminderScheduler.schedule(...)` para cada um.
2. O adapter `QStashReminderScheduler` registra no QStash um POST atrasado para
   `POST /api/reminders/dispatch` (variável `REMINDER_DISPATCH_URL`).
3. Na hora marcada, o QStash chama esse Route Handler, que valida o payload
   (e, em produção, a assinatura) e delega a `SendAppointmentReminderUseCase`.
4. O caso de uso reconfere se o agendamento ainda existe e envia o lembrete pelo
   `AppointmentNotifier` (WhatsApp).

Variáveis de ambiente usadas: `QSTASH_TOKEN`, `REMINDER_DISPATCH_URL`,
`WHATSAPP_API_URL`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`. Sem
elas, os adapters operam em "modo dev" (apenas logam), o que mantém o app
rodando sem credenciais.

## Por que isso responde à dúvida "Next.js ou Fastify?"

Como o caso de uso não conhece o mecanismo de entrega, ele pode ser chamado por:

- uma **Server Action** (agendamento pelo painel),
- um **Route Handler** (`app/api/...`) recebendo webhook do WhatsApp,
- uma futura **API Fastify**, reaproveitando `domain` + `application` inteiros.

Ou seja: comece no Next.js; só extraia um serviço separado se/quando houver um
motivo concreto (API pública, app mobile nativo, perfil de escala diferente).

## Testes

Os casos de uso são testados sem banco e sem HTTP, injetando fakes
(`InMemoryAppointmentRepository`, `FakeAppointmentNotifier`, `FixedClock`).

```bash
npm install -D vitest vite-tsconfig-paths   # uma vez
npm test                                     # roda os *.spec.ts
```

## Próximos passos sugeridos

- Migrar incrementalmente as regras das actions existentes (ex.: `upsert-appointment`) para casos de uso.
- Adicionar uma porta de fila/agendador (`ReminderScheduler`) para lembretes, com adapter em Inngest/Trigger.dev/BullMQ.
- Criar o bounded context `medical-records` no mesmo padrão.
- Adicionar testes de integração para os adapters Drizzle (ex.: Testcontainers).
