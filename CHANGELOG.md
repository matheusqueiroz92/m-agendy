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
