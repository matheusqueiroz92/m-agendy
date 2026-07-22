# Changelog

Registro das correções e mudanças relevantes da aplicação. Cada entrada
aponta para o documento com a explicação completa (causa raiz, código
alterado, testes) — este arquivo é só o resumo para consulta rápida.

## 2026-07-21 — Correções pós-lançamento (notificações WhatsApp + agendamento)

Encontradas durante o primeiro teste de ponta a ponta de notificações em
produção (Vercel). Nenhuma delas aparecia nos testes automatizados porque
dependiam do comportamento real de infraestrutura externa (Meta, QStash,
fuso horário do runtime) — só ficaram visíveis ao testar contra os serviços
de verdade.

### Corrigido

- **Colunas do plugin `admin` do BetterAuth ausentes** — criar clínica pelo
  admin quebrava com `BetterAuthError: The field "role" does not exist`.
  Adicionadas `role`/`banned`/`ban_reason`/`ban_expires` em `users`.
  Detalhes: [docs/08-administracao-e-planos.md](docs/08-administracao-e-planos.md).
- **Telefone do responsável da clínica não era salvo** — a coluna
  `users.phone_number` tinha sido removida por engano num commit antigo;
  restaurada. Detalhes: [docs/08](docs/08-administracao-e-planos.md).
- **QStash: endpoint de região errado** — o código sempre publicava no
  endpoint global (`https://qstash.upstash.io`, na prática a região EU);
  quem cria o token na região US precisa da variável `QSTASH_URL` apontando
  para o endpoint certo. Detalhes:
  [docs/03-variaveis-de-ambiente.md](docs/03-variaveis-de-ambiente.md),
  [docs/11-plano-notificacoes-whatsapp.md](docs/11-plano-notificacoes-whatsapp.md).
- **QStash: URL de destino escapada quebrava o agendamento (`400`)** —
  `encodeURIComponent` no destino fazia o QStash recusar com "invalid
  destination url: endpoint has invalid scheme". O destino agora vai cru na
  URL, como a API espera. Detalhes: [docs/11](docs/11-plano-notificacoes-whatsapp.md).
- **Telefone sem DDI impedia a entrega das notificações** — o cadastro
  (paciente e responsável) só coleta DDD + número, sem "55"; a Meta exige o
  número completo. Novo utilitário `toE164BR` normaliza o telefone antes de
  enviar (confirmação/lembrete/cancelamento) e ao comparar o telefone
  recebido no webhook com o do cadastro (confirmação por resposta, chatbot).
  Detalhes: [docs/11](docs/11-plano-notificacoes-whatsapp.md).
- **Agendamento salvo com o horário errado (deslocamento de fuso)** —
  combinar data + horário com `Date.prototype.setHours` usa o fuso do
  **processo**, não o da clínica; em produção (Vercel, runtime em UTC) uma
  consulta marcada para 10:00 era salva às 07:00. Novo utilitário
  `combineDateAndTimeInClinicTimezone` (e seu inverso,
  `formatInClinicTimezone`, usado nas mensagens/telas que mostram o
  horário) fixam o fuso em `America/Sao_Paulo` independente de onde o
  código roda. Detalhes: [docs/04-fluxos.md](docs/04-fluxos.md).
- **Horário disponível sendo recusado ao agendar** — a correção do fuso
  horário acima expôs um bug irmão: `isWithinAvailability`,
  `computeAvailableSlots` (`scheduling/domain/availability.ts`) e
  `DrizzleAvailabilityReader.getOccupiedIntervals` liam a data salva com
  `.getDay()/.getHours()/.getMinutes()/.getFullYear()` (fuso do processo);
  em produção uma consulta às 10:00 (13:00 UTC) era lida como 13:00 e caía
  fora da janela do profissional. Corrigido lendo/construindo essas datas
  via `dayjs(...).tz(CLINIC_TIMEZONE)`/`formatInClinicTimezone`. Detalhes:
  [docs/04-fluxos.md](docs/04-fluxos.md).

### Adicionado

- Campo **tipo do agendamento** (consulta ou retorno) no painel — ver
  [docs/04-fluxos.md](docs/04-fluxos.md).

## 2026-07-22 — Escala do WhatsApp com número compartilhado

Correções motivadas por uma pergunta de escala: com muitas clínicas usando o
mesmo número de WhatsApp compartilhado, como evitar bagunça e volume
descontrolado de mensagens?

### Corrigido

- **Chatbot de agendamento misturava clínicas no número compartilhado** —
  uma conversa nova (sem lembrete anterior) sempre caía numa única clínica
  fixa (`WHATSAPP_DEFAULT_CLINIC_ID`), já que não há como saber de qual
  clínica é uma mensagem nova no número compartilhado. Agora o chatbot de
  agendamento por conversa nova é restrito a clínicas com número próprio
  configurado; a confirmação de presença (resposta a um lembrete) não é
  afetada, pois resolve a clínica pelo agendamento existente. Detalhes:
  [docs/11-plano-notificacoes-whatsapp.md](docs/11-plano-notificacoes-whatsapp.md).
- **Busca de paciente por telefone carregava todos os pacientes em
  memória** — `DrizzleConfirmationLookup` (usado a cada mensagem recebida no
  webhook) trazia a tabela `patients` inteira para comparar telefone em JS.
  Agora filtra no banco. Detalhes: [docs/11](docs/11-plano-notificacoes-whatsapp.md).

### Adicionado

- **Limite diário de agendamentos por plano** (`maxAppointmentsPerDay`) —
  controla volume de mensagens de WhatsApp por dia, independente do limite
  mensal já existente. Essential 15/dia, Premium 40/dia, Gold ilimitado;
  avisa a clínica ao faltar 1 para o limite. Detalhes:
  [docs/08-administracao-e-planos.md](docs/08-administracao-e-planos.md).
- **Solicitação de integração de número próprio de WhatsApp** — novo
  entitlement `canUseOwnWhatsAppNumber` (Premium/Gold); clínica solicita em
  Configurações (botão, sem formulário), admin conclui em
  `/platform/whatsapp-requests` colando o `phone_number_id` obtido no Meta
  Business Manager. Clínica é avisada in-app na criação (número
  compartilhado) e na conclusão da integração. Campo de texto livre que
  existia antes em Configurações foi removido. Detalhes:
  [docs/11-plano-notificacoes-whatsapp.md](docs/11-plano-notificacoes-whatsapp.md).
- **Telefone do responsável na fila admin de WhatsApp** — coluna nova em
  `/platform/whatsapp-requests`, facilita achar o número certo para
  cadastrar no WABA. Detalhes: [docs/11](docs/11-plano-notificacoes-whatsapp.md).

## 2026-07-22 — Configurações e notificações: raio-x geral

Verificação geral pedida pelo Matheus: vários controles de Configurações
pareciam funcionar mas não tinham efeito real (valor descartado no servidor
ou botão sem handler). Detalhes: [docs/12-configuracoes-e-notificacoes.md](docs/12-configuracoes-e-notificacoes.md).

### Corrigido

- **Sino de notificações do header não fazia nada** — sem `onClick`, sem
  contagem. Agora vira link para `/notifications` com badge de não lidas
  (mesmo padrão do menu lateral). Itens "Perfil"/"Configurações" do menu da
  conta, que também não navegavam, agora vão para `/settings`.
- **Toggle "Lembretes de Agendamento" não ativava/desativava nada** — o
  valor era descartado no servidor. Agora é uma configuração real por
  clínica (`clinics.appointment_reminders_enabled`); os 3 casos de uso de
  criação de agendamento passam a checar isso antes de enfileirar os
  lembretes de 24h/2h (a confirmação imediata continua normal).
- **Toggle "Emails de Marketing" não ativava/desativava nada** — agora é um
  opt-in real por usuário (`users.marketing_emails_opt_in`).
- **Formulário de Configurações sempre mostrava os mesmos valores fixos**,
  independente do que estava salvo (nunca buscava o estado real no banco).
- **Botão "Atualizar Senha" não fazia nada** — sem `onClick`. Agora usa
  `authClient.changePassword` (BetterAuth), com validação RHF + Zod.

### Removido

- **Notificações por SMS** — não existe canal de SMS na aplicação.
- **Notificações por Email, Autenticação de Dois Fatores, Timeout de
  Sessão** — mesma classe de problema do SMS (nenhum efeito real, sem
  infraestrutura por trás).
- **Idioma e Fuso Horário** (Preferências) — não há i18n no projeto (UI
  inteira em português) nem fuso horário configurável por clínica (é uma
  constante única usada em todo o motor de agendamento). Removidos por
  enquanto para não sugerir uma opção que não muda nada; a aparência
  (claro/escuro) continua, pois já era real.

### Adicionado

- **Disparo de e-mails de marketing** — novo módulo `core/modules/marketing`
  e página `/platform/marketing-emails`: o admin da plataforma escreve
  assunto + conteúdo e envia para quem deu opt-in, com confirmação antes do
  disparo e contagem de sucesso/falha.

## 2026-07-22 — Correções do onboarding de clínica pelo admin

Encontradas testando manualmente o fluxo completo: criar clínica → e-mail de
redefinição de senha → responsável define senha → login.

### Corrigido

- **Telefone do responsável não aparecia em Configurações** — `customSession`
  (`src/lib/auth.ts`) montava a sessão a partir do objeto de usuário do
  BetterAuth, que não carrega campos fora de `additionalFields`
  (`phoneNumber` não estava declarado ali), em vez da consulta Drizzle direta
  que a mesma função já fazia e que tinha o valor certo. Detalhes:
  [docs/08-administracao-e-planos.md](docs/08-administracao-e-planos.md).
- **E-mail de verificação redundante e fora de ordem** — a conta do
  responsável, criada pelo admin, nasce agora com `emailVerified: true`
  (clicar no link de redefinir senha já prova posse do e-mail), eliminando o
  segundo e-mail que era disparado automaticamente no primeiro login.
  Detalhes: [docs/08](docs/08-administracao-e-planos.md).
- **Link de verificação de e-mail caía na landing page em vez do dashboard**
  — a página `/verify-email` fazia uma checagem manual via `fetch()` (sem
  repassar o `callbackURL`) seguida de um `router.push` — trocada por
  navegação de página inteira para o endpoint do BetterAuth, que cria a
  sessão e redireciona de verdade. Detalhes: [docs/08](docs/08-administracao-e-planos.md).
