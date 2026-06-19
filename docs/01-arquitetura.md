# Arquitetura

O M.Agendy é um SaaS de gestão de agendamentos e prontuário eletrônico para
clínicas e consultórios de qualquer segmento (médico, odontológico, fisioterapia,
nutrição, psicologia, etc.). É um **monólito Next.js** organizado segundo
**Arquitetura Hexagonal (Ports & Adapters)** com influência de **DDD**.

## Por que hexagonal num monólito Next.js

A regra de negócio vive isolada do framework. O Next.js (App Router, Server
Actions, Route Handlers) é só a **camada de entrega**. Isso permite:

- testar regras sem subir banco, HTTP ou e-mail;
- trocar fornecedores (banco, fila, mensageria, **gateway de pagamento**) mexendo
  só num adapter;
- escalar por extração: se um contexto precisar virar serviço próprio, o domínio
  já está desacoplado.

## As quatro camadas

```
delivery  →  application  →  domain
   ↑              ↓
 infra  (adapters concretos das portas)
```

1. **domain** — entidades, value objects e regras puras. Sem imports de
   framework, banco ou HTTP. Ex.: `Appointment`, `Diagnosis`, `AuthenticatedActor`,
   `verifyMetaSignature`, regras de conflito de horário.
2. **application** — casos de uso (orquestram o domínio) e **portas**
   (interfaces que o caso de uso exige). Ex.: `UpsertAppointmentUseCase`,
   `PaymentGateway`, `AppointmentRepository`.
3. **infra** — **adapters** que implementam as portas com tecnologia concreta
   (Drizzle/Postgres, Meta WhatsApp, QStash, Stripe) + **factories** (composition
   root) que montam os casos de uso com seus adapters.
4. **delivery** — Server Actions (`src/actions`), Route Handlers
   (`src/app/api`) e páginas. São **cascas finas**: resolvem o ator/sessão,
   chamam a factory do caso de uso e devolvem o resultado.

### Fluxo de uma requisição (exemplo: criar agendamento)

```
Form (RHF + Zod)
  → Server Action src/actions/upsert-appointment        (delivery)
    → makeUpsertAppointment()                            (infra/factory)
      → UpsertAppointmentUseCase.execute()               (application)
        → Authorizer / Appointment (regras)              (domain)
        → AppointmentRepository.save()                   (porta → adapter Drizzle)
        → AppointmentNotifier / ReminderScheduler        (portas → WhatsApp/QStash)
```

## Estrutura de pastas

```
src/
├── app/                         # Next.js App Router (delivery)
│   ├── (protected)/             # rotas autenticadas (dashboard, agenda, prontuário...)
│   ├── agendar/[clinicId]/      # agendamento público (paciente, sem login)
│   ├── portal/                  # portal do paciente (read-only)
│   └── api/                     # Route Handlers (webhooks, auth, uploads)
├── actions/                     # Server Actions (cascas finas + schemas Zod)
├── core/                        # NÚCLEO hexagonal (independente de framework)
│   ├── shared/                  # base transversal
│   │   ├── domain/              # DomainError, erros (Unauthorized/Forbidden/NotFound)
│   │   ├── application/ports/   # AuditLog, Clock
│   │   ├── infra/               # DrizzleAuditLog, SystemClock
│   │   └── security/            # verifyMetaSignature (HMAC webhook)
│   └── modules/                 # um diretório por contexto delimitado
│       ├── iam/                 # identidade, papéis, autorização
│       ├── clinics/             # tipo de clínica + rótulos por segmento
│       ├── patients/            # pacientes
│       ├── professionals/       # profissionais
│       ├── scheduling/          # agenda, lembretes, confirmação, chatbot
│       ├── medical-records/     # prontuário (antecedentes, diagnósticos, etc.)
│       ├── notifications/       # avisos in-app da clínica
│       ├── patient-portal/      # agenda do paciente (read-only)
│       └── billing/             # assinatura/pagamentos (gateway-agnostic)
├── components/ui/               # ShadCN/ui
├── db/                          # schema Drizzle + client (index.ts)
└── lib/                         # auth (BetterAuth), next-safe-action
```

Cada módulo segue `domain / application(ports, use-cases, testing) / infra(persistence, factories...)`.

## Contextos delimitados (bounded contexts)

| Módulo | Responsabilidade |
|---|---|
| **iam** | `AuthenticatedActor`, papéis (plataforma e clínica), `Authorizer`, redirecionamento pós-login |
| **clinics** | Tipo e rótulos por segmento; status (bloqueio) e override de plano; gestão administrativa de clínicas |
| **patients** | CRUD de pacientes (multi-tenant por clínica) |
| **professionals** | CRUD de profissionais |
| **scheduling** | Agendamento (painel e público), lembretes, confirmação por WhatsApp, chatbot de agendamento |
| **medical-records** | Prontuário: antecedentes, diagnósticos, prescrições, atendimentos, acompanhamentos + auditoria de leitura |
| **notifications** | Notificações in-app da clínica (confirmações etc.) |
| **patient-portal** | Visão read-only da agenda do paciente |
| **billing** | Checkout e webhooks de assinatura (**independente de gateway**) + catálogo central de planos |

## Conceitos transversais

- **DomainError**: base de todos os erros de regra. Subclasses
  `UnauthorizedError`/`ForbiddenError`/`NotFoundError` (+ erros de cada domínio).
  Em `lib/next-safe-action.ts`, só mensagens de `DomainError` chegam ao usuário;
  o resto vira mensagem genérica (não vaza stack/SQL).
- **IAM / Authorizer**: centraliza permissões. `assertAuthenticated`,
  `assertMemberOfClinic`, `assertCanManageClinic`, `assertCanAccessClinicalData`.
- **Multi-tenant**: isolamento por `clinicId` em todas as queries; o
  `Authorizer` garante que o ator pertence à clínica.
- **AuditLog**: trilha de auditoria (LGPD), inclusive **leitura de prontuário**.
- **Clock**: relógio injetável (`SystemClock` em produção, `FixedClock` em teste).

## Testes

Vitest cobre **domínio e casos de uso** com fakes das portas (sem banco/HTTP).
Os fakes ficam em `application/testing/` de cada módulo. Rode com `npm run test`.
