# Plano de Migração — Arquitetura Hexagonal/DDD (M.Agendy)

> Documento vivo. Objetivo: migrar o M.Agendy, contexto por contexto, para a
> arquitetura limpa já iniciada em `src/core` — **entregando features novas no
> mesmo ciclo de cada migração** (estratégia _strangler fig_). O SaaS ainda não
> está em produção, o que nos permite refatorar e ajustar dados sem pressa.

## 1. Princípios

- **Strangler fig**: migra-se um contexto por vez; o código antigo convive com o
  novo até a fatia ser concluída e a UI repontada.
- **Refatorar + feature juntos**: cada migração de contexto entrega também a
  feature nova daquele contexto, evitando retrabalho e mantendo valor visível.
- **Regra de dependência**: `infra → application → domain` (o domínio não conhece
  Next, Drizzle, WhatsApp ou HTTP). Detalhes em `src/core/README.md`.
- **Tudo com testes**: domínio e casos de uso com testes unitários (rápidos);
  adapters com testes de integração; fluxos críticos com e2e.
- **Multi-tenancy e LGPD como cidadãos de primeira classe**: isolamento por
  clínica e trilha de auditoria não são "depois", são parte da Definição de Pronto.

## 2. Mapa de contextos (bounded contexts)

| Contexto | Estado hoje | Alvo | Features novas | Depende de |
|---|---|---|---|---|
| **Acesso & Multi-tenancy (IAM)** | Inexistente como contexto; só `users_to_clinics` sem papéis | Papéis (admin de plataforma, gestor, profissional, paciente), guarda de autorização, escopo por clínica | Admin de plataforma (gerenciar todas as clínicas); gestão por clínica | — (fundacional) |
| **Pacientes** | Padrão antigo (actions → Drizzle) | Hexagonal | (entra junto com IAM) | IAM |
| **Médicos/Profissionais** | Padrão antigo | Hexagonal; generalizar "médico" → "profissional"; vincular a login | Profissionais com acesso próprio | IAM |
| **Agendamento** | Esqueleto em `src/core` (não plugado) + actions antigas em uso | Hexagonal completo, plugado na UI | Booking online pelo paciente; lembretes; confirmação WhatsApp | IAM, Profissionais, Mensageria |
| **Prontuário eletrônico** | Padrão antigo (9 actions) | Hexagonal + auditoria reforçada | — (foco em segurança/LGPD) | IAM, Agendamento |
| **Mensageria & Notificações** | Esqueleto (`WhatsAppAppointmentNotifier`, `QStashReminderScheduler`) | Cross-cutting consolidado | Chatbot WhatsApp (webhook de entrada), confirmações | Fila/QStash |
| **Portal do Paciente** | Inexistente | Novo contexto (área pública/autenticada do paciente) | Histórico, próximas consultas, documentos | IAM, Agendamento, Prontuário |
| **Assinatura/Billing (Stripe)** | Padrão antigo (webhook + checkout) | Hexagonal (opcional/último) | — | IAM |

## 3. Receita de migração (repetível por contexto)

Para cada contexto, seguir sempre os mesmos passos:

1. **Mapear** as regras hoje espalhadas nas actions e o schema envolvido.
2. **Domínio**: criar entidades/value objects e invariantes puras + testes unitários.
3. **Portas (application)**: definir interfaces de repositório e serviços externos.
4. **Casos de uso (application)**: mover a lógica das actions para use cases + testes com fakes.
5. **Adapters (infra)**: implementar as portas com Drizzle/serviços + testes de integração.
6. **Composition root**: criar as factories que montam os use cases.
7. **Delivery**: transformar Server Actions / Route Handlers em cascas finas que só chamam a factory e mapeiam erros de domínio.
8. **Repontar a UI** para o novo fluxo; **remover** a action antiga.
9. **Autorização + escopo de tenant** aplicados; **eventos de auditoria** emitidos quando relevante.
10. **Atualizar docs** e marcar a Definição de Pronto (seção 7).

## 4. Roadmap por fases

### Fase 0 — Fundações transversais (curta, habilita o resto)

Sem isso, cada migração reinventa a roda.

- Padronizar **tratamento de erros de domínio**: configurar `handleServerError`
  no `next-safe-action` para mapear `DomainError` → mensagem ao usuário (hoje as
  actions lançam `Error` solto).
- Criar a base de **autorização**: um value object `AuthenticatedActor`
  (userId, papel, clínicas) e uma porta/serviço `Authorizer`/`Policy`.
- Criar a base de **auditoria** (porta `AuditLog` + tabela `audit_logs`).
- Confirmar a **pirâmide de testes**: Vitest (unit/integration) já configurado;
  adicionar Testcontainers (ou banco Neon de teste) para adapters e Playwright
  para e2e dos fluxos críticos.
- (Opcional) **CI** rodando `lint` + `test` + `tsc` em cada PR.

### Fase 1 — Acesso & Multi-tenancy (IAM) + Pacientes

O contexto fundacional + a primeira fatia simples, juntos.

**IAM / Admin**
- Modelagem de papéis (ver seção 5): `platform_admin` (você, desenvolvedor),
  `clinic_manager` (gestor), `professional`, `patient`.
- Migração de schema: papel em `users_to_clinics`; flag/role de plataforma em `users`.
- Casos de uso: listar/criar/editar/suspender clínicas (admin de plataforma);
  convidar/gerenciar membros de uma clínica (gestor).
- Área **/admin** (plataforma) e reforço das telas de clínica com base no papel.
- Guarda de autorização aplicada nas Server Actions/rotas.

**Pacientes (primeira migração de contexto)**
- Domínio `Patient` + invariantes (e-mail válido, telefone, etc.).
- Portas `PatientRepository`; casos de uso `UpsertPatient`, `DeletePatient`, `ListPatients`.
- Adapter Drizzle + testes; delivery fino; repontar telas de Pacientes.
- Escopo por clínica garantido no repositório; auditoria de criação/edição/remoção.

### Fase 2 — Médicos/Profissionais

- Generalizar o conceito para **Profissional** (médico, dentista, nutricionista…),
  mantendo `speciality` e disponibilidade.
- Opcional: vincular profissional a um `user` para que ele acesse a própria agenda
  (papel `professional`).
- Migrar `upsert-doctor`/`delete-doctor` para o padrão; repontar telas de Médicos.

### Fase 3 — Agendamento (migração + features)

- Finalizar o módulo `scheduling`: migrar `upsert-appointment`, `delete-appointment`
  e `get-available-time-slots` para casos de uso; **plugar `ScheduleAppointment` na
  UI** substituindo o `upsertAppointment` antigo.
- **Lembretes**: ligar o `ReminderScheduler` ao fluxo real; implementar
  `cancelForAppointment` em remarcação/cancelamento.
- **Confirmação por WhatsApp**: usar o `AppointmentNotifier`.
- **Agendamento online pelo paciente** (feature): fluxo público/área do paciente
  que consome o caso de uso `ScheduleAppointment` (com regras de disponibilidade e
  política de clínica). Reaproveita 100% do domínio.

### Fase 4 — Prontuário eletrônico (migração + segurança)

- Migrar os contextos do prontuário (atendimentos, diagnósticos, prescrições,
  acompanhamentos, antecedentes) para domínio + casos de uso.
- **Auditoria/LGPD reforçada**: registrar acesso e alteração de dados sensíveis;
  considerar criptografia em repouso de campos críticos; controle de acesso por papel.

### Fase 5 — Portal do Paciente (novo contexto)

- Autenticação do paciente (decisão na seção 5).
- Casos de uso de leitura: próximas consultas, histórico, documentos do prontuário
  liberados; e o agendamento online (reuso da Fase 3).

### Fase 6 — Mensageria & Chatbot WhatsApp (consolidação cross-cutting)

- Webhook de **entrada** do WhatsApp (Route Handler) com validação de assinatura e
  idempotência.
- Automação: confirmação/cancelamento por resposta ("CONFIRMAR"), respostas do
  chatbot, reenvios via fila.
- Consolidar provedores atrás das portas (`AppointmentNotifier`, e uma futura
  `InboundMessageHandler`).

### Fase 7 — Assinatura/Billing (opcional, por último)

- Migrar checkout e webhook do Stripe para casos de uso, se/quando trouxer ganho.

## 5. Decisões de modelagem (Acesso, Tenancy e Identidade)

Propostas a validar antes de implementar a Fase 1:

**Papéis**
- Plataforma: `users.platformRole` (`platform_admin` | `member`) — `platform_admin`
  é você, com acesso ao /admin global.
- Por clínica: `users_to_clinics.role` (`owner` | `manager` | `professional` | `staff`).
  Um usuário pode ter papéis diferentes em clínicas diferentes.

**Isolamento multi-tenant**
- Toda consulta passa por `clinicId`; padronizar isso no **repositório** (e não
  ad-hoc nas actions) para nunca vazar dados entre clínicas.
- Os casos de uso recebem um `AuthenticatedActor` e validam acesso via `Authorizer`
  antes de operar.

**Identidade de profissional e paciente**
- Profissional: adicionar `doctors.userId` (nullable) para login próprio.
- Paciente (portal): decidir entre (a) vincular `patients.userId` ao BetterAuth, ou
  (b) um fluxo de identidade separado para pacientes. Recomendação inicial: reaproveitar
  o BetterAuth com papel `patient` e vínculo `patients.userId`.

**Generalização**
- Renomear conceitualmente "médico" → "profissional" no domínio (a tabela pode
  permanecer `doctors` inicialmente para reduzir atrito de migração).

## 6. Padrões transversais (aplicados em todos os contextos)

- **Erros**: `DomainError` mapeado na borda; nunca vazar stack/SQL ao cliente.
- **Autorização**: porta `Authorizer` + `AuthenticatedActor`; checagem no caso de uso.
- **Auditoria**: porta `AuditLog`; registrar quem/o quê/quando em dados sensíveis.
- **Filas/agendamento**: `ReminderScheduler` (QStash hoje); webhooks idempotentes.
- **Testes**: unit (domínio/use cases) · integração (adapters Drizzle) · e2e (Playwright)
  para agendar, confirmar/cancelar via WhatsApp e acessar prontuário.

## 7. Definição de Pronto (checklist por contexto)

- [ ] Entidades + invariantes no `domain`, com testes unitários.
- [ ] Portas definidas em `application`.
- [ ] Casos de uso com testes (fakes), cobrindo caminhos felizes e erros.
- [ ] Adapters Drizzle com testes de integração.
- [ ] Autorização e escopo de clínica aplicados (sem vazamento entre tenants).
- [ ] Delivery (actions/rotas) reduzido a casca fina; action antiga removida.
- [ ] UI repontada para o novo fluxo.
- [ ] Eventos de auditoria emitidos onde houver dado sensível.
- [ ] Feature nova do contexto entregue e testada.
- [ ] Documentação atualizada (`src/core/README.md` e este plano).

## 8. Riscos e mitigação

- **Vazamento entre clínicas**: centralizar escopo no repositório + testes que
  garantem isolamento.
- **Escopo inchando por misturar refatoração e feature**: PRs pequenos, um contexto
  por vez, Definição de Pronto como trava.
- **Migrações de dados (papéis, vínculos)**: como não há produção, aplicar via
  `drizzle-kit push` em ambiente de teste e validar com seeds.
- **Dupla escrita durante a transição**: manter a action antiga só até a UI ser
  repontada; remover em seguida para não divergir.
- **Segurança de webhooks (WhatsApp/QStash)**: validar assinatura e idempotência
  desde o primeiro envio real.

## 9. Sugestão de execução (tamanho de PR)

Quebrar cada fase em PRs pequenos e revisáveis, por exemplo na Fase 1:
`(1) schema de papéis` → `(2) Authorizer + guarda` → `(3) área /admin de clínicas`
→ `(4) domínio+portas de Pacientes` → `(5) casos de uso + testes` → `(6) adapter
Drizzle` → `(7) repontar UI e remover action antiga` → `(8) auditoria`.

---

### Próximo passo sugerido

Iniciar a **Fase 0** (fundações: mapeamento de erros, base de `Authorizer` e
`AuditLog`) e, em seguida, a **Fase 1** (papéis + admin de plataforma + migração de
Pacientes). Posso começar pela Fase 0 e já deixar a base de autorização pronta,
ou ir direto à modelagem de papéis da Fase 1 — você escolhe.
