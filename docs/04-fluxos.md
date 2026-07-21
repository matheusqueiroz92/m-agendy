# Fluxos da aplicação

## 1. Autenticação e papéis

- Login/cadastro em `/auth` (e-mail/senha ou Google) via **BetterAuth**.
- A sessão é enriquecida (`customSession`) com `platformRole`, a clínica atual
  (`clinic`) e a lista de vínculos (`clinics` com papel em cada uma).
- O adapter `getAuthenticatedActor()` traduz a sessão no value object
  `AuthenticatedActor`, único objeto que os casos de uso conhecem.
- **Redirecionamento pós-login inteligente** (`iam/domain/landing-route`), por
  precedência: **admin de plataforma → `/platform`**; **clínica bloqueada →
  `/clinic-suspended`**; equipe sem clínica → `/clinic-form`; sem plano →
  `/new-subscription`; paciente → `/portal`; com plano → `/dashboard`.

### Papéis

**Plataforma:** `platform_admin` (operador do SaaS) e `member`.
**Clínica:** `owner`, `manager`, `professional`, `staff`.

- Gestão da clínica (config, equipe): `owner`/`manager`.
- **Dados clínicos (prontuário):** `owner`/`manager`/`professional`. O papel
  `staff` (recepção) é **barrado** — ver RBAC em
  [gestão e operação](07-gestao-e-operacao.md).

### Áreas separadas: plataforma x clínica

O admin de plataforma usa a área **`/platform`** (gestão das clínicas
contratantes) e a clínica usa o painel próprio. Bloquear uma clínica leva seus
usuários à tela `/clinic-suspended`. Detalhes em
[administração e planos](08-administracao-e-planos.md).

## 2. Agendamento pelo painel (equipe)

```
Form → upsert-appointment (action) → UpsertAppointmentUseCase
  → valida papel de gestão, isolamento por clínica, data futura e conflito
  → salva → registra auditoria
  → (best-effort) envia confirmação WhatsApp + agenda lembretes
```

Conflitos de horário do mesmo profissional são rejeitados
(`AppointmentConflictError`). Confirmação e lembretes nunca derrubam o
agendamento (são best-effort, com `try/catch`).

### Fuso horário

A aplicação assume um único fuso horário para todas as clínicas:
`America/Sao_Paulo` (`CLINIC_TIMEZONE`, em
`src/core/shared/domain/combine-date-and-time.ts`). O formulário só coleta
data + horário (ex.: "10:00"), sem fuso — combinar isso com
`Date.prototype.setHours` usaria o fuso horário de onde o **código** roda, e
não o da clínica. Em dev isso "funciona por acidente" (a máquina do
desenvolvedor já está no fuso do Brasil); em produção (Vercel, runtime em
UTC) o mesmo código deslocava o horário em 3h (10:00 virava 07:00).

Correção: toda combinação de data+horário passa por
`combineDateAndTimeInClinicTimezone(date, time)` (usada em
`upsert-appointment`, `book-appointment` e `reschedule-appointment`), que
interpreta o horário explicitamente no fuso da clínica via `dayjs`
(`utc`/`timezone` plugins), independente do fuso do processo. Formatação de
volta para exibição/mensagens (WhatsApp, notificação in-app, portal do
paciente) usa `formatInClinicTimezone(date, pattern)`, pelo mesmo motivo —
`dayjs(date).format(...)` sem `.tz(...)` também usa o fuso local do
processo.

> Se o produto expandir para clínicas fora do fuso de Brasília, isso precisa
> virar uma configuração por clínica em vez de uma constante global.

A correção acima expôs um bug relacionado: com `scheduledAt` agora salvo
corretamente como instante UTC, as funções que **leem** essa data para checar
disponibilidade (`isWithinAvailability`, `computeAvailableSlots`, em
`scheduling/domain/availability.ts`, e
`DrizzleAvailabilityReader.getOccupiedIntervals`) ainda usavam
`.getDay()`/`.getHours()`/`.getMinutes()`/`.getFullYear()` — métodos do fuso
do **processo**. Em produção (UTC), uma consulta às 10:00 (13:00 UTC) era lida
como se fosse às 13:00, rejeitando horários genuinamente disponíveis
(`"O horário escolhido está fora da disponibilidade do profissional"`).
Corrigido lendo/construindo essas datas explicitamente via
`dayjs(...).tz(CLINIC_TIMEZONE)` e `formatInClinicTimezone`, pelo mesmo padrão
já usado na escrita.

### Tipo do agendamento (consulta ou retorno)

Todo agendamento tem um `type`: `"consultation"` (primeira consulta/avaliação,
padrão) ou `"return_visit"` (retorno de um atendimento anterior). É puramente
informativo — não afeta preço, conflito de horário nem lembretes — e serve
para a equipe identificar rapidamente o perfil da agenda.

- Só é editável pelo **painel da clínica** (`UpsertAppointmentForm`), tanto ao
  criar quanto ao editar.
- Agendamento **online pelo paciente** (link público) e pelo **chatbot** não
  expõem esse campo: entram sempre como `"consultation"` — a equipe pode
  corrigir depois pela edição, caso seja de fato um retorno.
- Domínio: `AppointmentType` em `scheduling/domain/appointment.ts`.

## 3. Agendamento online pelo paciente (sem login)

Duas portas de entrada, ambas **sem autenticação do paciente**:

- **Link público** `/agendar/[clinicId]`: o paciente escolhe profissional, dia e
  horário; o sistema casa pelo e-mail/telefone e cria o agendamento.
- **Chatbot de WhatsApp** (ver abaixo).

Horários livres são calculados por `computeAvailableSlots` a partir da
disponibilidade do profissional menos os horários já ocupados.

## 4. Lembretes

- Ao criar/editar um agendamento com telefone, o `UpsertAppointmentUseCase`
  agenda lembretes via porta `ReminderScheduler` (adapter **QStash**: HTTP
  atrasado). Na edição, os lembretes antigos são cancelados e reagendados.
- No horário, o QStash chama `/api/reminders/dispatch`, que dispara a mensagem.
- Sem `QSTASH_TOKEN`, opera em modo dev (loga no console).

## 5. Confirmação por WhatsApp

```
Paciente responde "CONFIRMAR/SIM/OK" no WhatsApp
  → POST /api/whatsapp/webhook (assinatura validada)
  → ConfirmAppointmentFromWhatsAppUseCase
  → acha a próxima consulta pendente do telefone → marca "confirmed"
  → cria notificação in-app para a clínica
```

A clínica vê a confirmação em `/notifications` e no **badge** da barra lateral.

## 6. Chatbot de agendamento (WhatsApp)

Conversa stateful por telefone (`whatsapp_conversations`), conduzida por
`HandleChatbotMessageUseCase` (domínio puro em `scheduling/domain/chatbot.ts`):

```
mensagem → resolve a clínica pelo phone_number_id (multi-tenant)
  → identifica o paciente pelo telefone
     • desconhecido → envia o link público de agendamento
     • conhecido → lista profissionais → escolhe data → lista horários livres
       → confirma → agenda (reusa o fluxo de agendamento: confirmação + lembretes)
```

Tratamentos: `cancelar` encerra; entrada inválida re-pergunta; **corrida de
horário** (alguém pegou o slot entre listar e confirmar) re-oferece os horários
restantes ou pede outra data.

### Segurança do webhook

- **GET**: handshake do Meta (compara `hub.verify_token` com `WHATSAPP_VERIFY_TOKEN`).
- **POST**: valida `X-Hub-Signature-256` (HMAC-SHA256 do corpo cru com
  `WHATSAPP_APP_SECRET`, comparação em tempo constante) antes de processar.

## 7. Prontuário eletrônico

Por paciente, em abas: **antecedentes** (clínicos/cirúrgicos/familiares/hábitos/
alergias/medicamentos), **diagnósticos**, **prescrições**, **atendimentos** e
**acompanhamentos**, além do histórico de consultas.

- Toda escrita passa por um caso de uso que valida papel (não-`staff`),
  isolamento por clínica e registra auditoria.
- **Leitura** também é auditada: abrir o prontuário dispara
  `LogMedicalRecordAccessUseCase` (`medical_record.viewed`) — exigência de LGPD.

## 8. Assinatura / pagamentos

```
/subscription → createStripeCheckout (action) → CreateCheckoutSessionUseCase
  → PaymentGateway.createCheckoutSession() → URL do checkout hospedado
  → o cliente é redirecionado para a URL

Webhook do provedor → POST /api/stripe/webhook → HandleBillingWebhookUseCase
  → PaymentGateway.parseWebhookEvent() devolve um BillingEvent normalizado
  → ativa/desativa a assinatura do usuário (SubscriptionRepository)
```

A UI é **agnóstica de gateway**: só usa a `checkoutUrl`. Para trocar de
provedor, ver [conectando gateways](06-gateways-de-pagamento.md).

O **plano efetivo** da clínica considera o override concedido pela plataforma
(cortesia/desconto) com precedência sobre a assinatura, e fica indisponível se a
clínica estiver bloqueada — ver [administração e planos](08-administracao-e-planos.md).
