# Plano de implementação — Notificações WhatsApp confiáveis

> Decorre da análise registrada em `docs/09-auditoria-para-lancamento.md` e
> `docs/10-estrategia-de-testes.md`. Este documento cobre especificamente o
> sistema de confirmação/lembrete de consultas via WhatsApp — a
> funcionalidade central de redução de faltas do produto.

## Decisão de provedor (registrada em 16/07/2026)

Avaliamos manter a integração direta com a **Meta Cloud API** (já
implementada) versus migrar para **Twilio** (BSP oficial) ou **Z-API** (API
não oficial). Decisão: **manter Meta Cloud API direto**. Razões:

- **Z-API descartado**: é automação não oficial sobre o WhatsApp Web. A Meta
  intensificou a detecção desse tipo de tráfego em 2026, e houve uma onda
  documentada de banimentos permanentes de números comerciais no Brasil que
  usavam esse tipo de API neste ano. Para um SaaS pago cujo valor central é
  o lembrete automático, um banimento apaga o WhatsApp da clínica da noite
  para o dia, sem direito a recurso — risco incompatível com o produto.
- **Twilio descartado por ora**: Twilio é um BSP legítimo, mas é só um
  intermediário sobre a mesma Meta Cloud API — repassa a tarifa da Meta e
  cobra um adicional próprio (~US$0,005–0,01 por mensagem) por cima, além de
  exigir reescrever os adapters para a API deles. Como o problema real não é
  o provedor, e sim o **tipo de mensagem** (ver Fase 1), migrar para Twilio
  não resolveria nada sozinho e ainda aumentaria o custo por mensagem.
- **Meta Cloud API direto**: já implementado, mais barato (mensagem
  utilitária de lembrete/confirmação fica na faixa de R$0,04–0,05 no Brasil,
  a categoria mais barata), e é a integração oficial — sem risco de
  banimento por uso indevido. O custo de manter é a verificação do negócio
  no Business Manager da Meta, que já é pré-requisito hoje.

## Fase 1 — Templates aprovados (crítico, bloqueia o valor do produto)

**Problema**: `WhatsAppAppointmentNotifier` e `HttpWhatsAppMessenger`
(`src/core/modules/scheduling/infra/messaging/`) enviam `type: "text"`
(mensagem de texto livre). Pela política da Meta, texto livre só é
entregue se o paciente escreveu para o número da clínica nas últimas 24h.
Confirmação e lembrete são iniciados pela clínica — na maioria dos casos,
fora dessa janela — então a Graph API deve recusar a entrega em produção
real, mesmo com credenciais corretas.

**O que fazer**:

1. Cadastrar dois templates de categoria **utilitária** (não "marketing" —
   utilitária é mais barata e mais fácil de aprovar por não ser promocional)
   no WhatsApp Manager: `confirmacao_agendamento` e `lembrete_agendamento`,
   com variáveis posicionais para nome do paciente, profissional e
   data/hora. Aprovação da Meta costuma levar poucas horas, mas pode demorar
   mais — iniciar isso o quanto antes, em paralelo ao resto do plano.
2. Estender `WhatsAppAppointmentNotifier.send` para montar o payload de
   template:
   ```json
   {
     "messaging_product": "whatsapp",
     "to": "...",
     "type": "template",
     "template": {
       "name": "confirmacao_agendamento",
       "language": { "code": "pt_BR" },
       "components": [{ "type": "body", "parameters": [{ "type": "text", "text": "..." }] }]
     }
   }
   ```
3. Novas variáveis de ambiente: `WHATSAPP_TEMPLATE_CONFIRMATION_NAME`,
   `WHATSAPP_TEMPLATE_REMINDER_NAME`, `WHATSAPP_TEMPLATE_LANGUAGE` (default
   `pt_BR`). Documentar em `docs/03-variaveis-de-ambiente.md`.
4. Manter o modo dev atual (sem credenciais → só loga no console) sem
   mudança de comportamento.
5. `HttpWhatsAppMessenger` (usado pelo chatbot, respondendo dentro da
   conversa iniciada pelo paciente) **não precisa mudar** — texto livre
   funciona normalmente dentro da janela de 24h de uma conversa em curso.
6. Teste manual obrigatório antes de considerar concluído: enviar para um
   número de teste **fora** de qualquer janela de 24h aberta e confirmar
   entrega real. É a única forma de validar que o template foi de fato
   aprovado e que o formato do payload está correto — não dá para validar
   isso só com teste automatizado/mock.

## Fase 2 — Segurança do endpoint de disparo de lembretes ✅ implementada (16/07/2026)

**Problema**: `src/app/api/reminders/dispatch/route.ts` já documenta em
comentário que deveria validar o cabeçalho `Upstash-Signature`, mas isso
nunca foi implementado — o pacote `@upstash/qstash` nem está no
`package.json`. Hoje, qualquer requisição externa com um `appointmentId`
válido consegue disparar envio de WhatsApp para o paciente daquela consulta.

**O que fazer**:

1. `npm install @upstash/qstash`.
2. Usar a classe `Receiver` do pacote para validar `Upstash-Signature`
   contra `QSTASH_CURRENT_SIGNING_KEY`/`QSTASH_NEXT_SIGNING_KEY` (a Upstash
   rotaciona chaves; validar contra as duas evita quebrar em rotação).
3. Sem essas variáveis configuradas, pular a validação com aviso no
   console — mesmo padrão já usado no webhook do WhatsApp
   (`WHATSAPP_APP_SECRET` ausente → modo dev).
4. Documentar as novas envs em `docs/03-variaveis-de-ambiente.md`.
5. Teste de integração de assinatura, seguindo o mesmo padrão já aplicado
   aos webhooks de WhatsApp/Stripe (`docs/10-estrategia-de-testes.md`):
   requisição sem assinatura → 401; com assinatura válida gerada via
   `Receiver` de teste → 200.

**Implementado**: `src/core/shared/security/qstash-signature.ts`
(`verifyQStashSignature`, mesmo formato de `verifyMetaSignature`) + aplicado em
`src/app/api/reminders/dispatch/route.ts` (lê corpo cru, valida
`Upstash-Signature`, só então faz `JSON.parse`). Dependência
`@upstash/qstash` adicionada ao `package.json` — **rode `npm install`
localmente** para baixar o pacote de verdade antes de testar. Envs novas:
`QSTASH_CURRENT_SIGNING_KEY`, `QSTASH_NEXT_SIGNING_KEY`.

**Ressalva sobre o teste unitário** (`qstash-signature.spec.ts`): diferente do
HMAC do WhatsApp (recomputável com `node:crypto`) ou da Stripe (que expõe
`generateTestHeaderString`), o `Receiver` do QStash valida um JWT interno cujo
formato exato não reconstruí com confiança sem rodar o pacote de verdade. O
teste mocka o `Receiver` do SDK e cobre a LÓGICA do nosso wrapper (modo dev,
header ausente, erro do Receiver vira rejeição) — não valida o algoritmo de
assinatura em si. **Valide manualmente contra um QStash real** (ou o
publicador de teste do console da Upstash) antes de confiar nisso em
produção — é o item que eu mais recomendo conferir na íntegra, já que não
consegui rodar nada neste ambiente (ver `docs/10`, seção "Sobre verificação").

## Fase 3 — No-show e aviso de cancelamento ✅ implementada (17/07/2026)

**Problema**: o status `no_show` existe no schema mas não é usado em lugar
nenhum. Excluir um agendamento (`DeleteAppointmentUseCase`) apaga a linha do
banco (perde histórico/auditoria) e não avisa o paciente.

**O que fazer, em duas etapas**:

1. **Marcação manual de falta (rápido, sem infraestrutura nova)**: novo
   caso de uso `MarkAppointmentNoShowUseCase` (segue o padrão de
   `delete-appointment.ts`: valida `Authorizer`, isolamento por clínica,
   `updateStatus(id, "no_show")`, registra auditoria). Adicionar opção
   "Marcar falta" no menu de `table-actions.tsx`
   (`src/app/(protected)/appointments/_components/`), ao lado de
   Editar/Excluir.
2. **Cancelamento como soft delete + aviso ao paciente**: hoje "Excluir"
   apaga a linha. Recomendo trocar para `status: "cancelled"` (soft
   delete), preservando o registro para auditoria/métricas futuras de
   faltas — e, no mesmo caso de uso, notificar o paciente via novo método
   `notifyCancelled` na porta `AppointmentNotifier`, usando um terceiro
   template aprovado (`cancelamento_agendamento`). Essa troca de
   comportamento (apagar → cancelar) é uma mudança visível para quem já usa
   o painel — vale confirmar com você antes de implementar, já que
   `AppointmentRepository.delete` deixaria de ser chamado neste fluxo.
3. Automatizar a marcação de no-show (ex.: job agendado X minutos após o
   horário da consulta que verifica se o status ainda é `"pending"` e, se
   for, marca `no_show` automaticamente, reaproveitando a mesma infra do
   `ReminderScheduler`/QStash) fica como evolução natural depois da etapa 1,
   não é bloqueador de lançamento.

**Implementado**:
- Etapa 1: `MarkAppointmentNoShowUseCase` (`src/core/modules/scheduling/application/use-cases/mark-appointment-no-show.ts`)
  + action `markAppointmentNoShow` + opção "Marcar falta" em
  `table-actions.tsx`. Também adicionei uma coluna de status (Pendente/
  Confirmado/Cancelado/Falta) em `table-columns.tsx` — não existia nenhuma
  exibição de status na tabela até então, o que tornaria a marcação de falta
  invisível na prática.
- Etapa 2 (confirmada com você antes de implementar): `DeleteAppointmentUseCase`
  virou `CancelAppointmentUseCase` (`cancel-appointment.ts`) — `status:
  "cancelled"` em vez de `DELETE`, cancela lembretes pendentes e avisa o
  paciente via `notifyCancelled` (novo método na porta `AppointmentNotifier`,
  implementado em `WhatsAppAppointmentNotifier` com um terceiro template,
  `WHATSAPP_TEMPLATE_CANCELLATION_NAME`). Action e arquivos renomeados de
  `delete-appointment` para `cancel-appointment`; UI do menu trocou "Excluir"
  por "Cancelar agendamento", com aviso explícito ao usuário de que o
  paciente será notificado.
- Etapa 3 (automação do no-show) **não foi implementada** — segue como
  evolução futura, não bloqueadora, conforme já indicado acima.

**Pendente da sua parte**: cadastrar o terceiro template
(`cancelamento_agendamento`) no WhatsApp Manager, junto dos outros dois da
Fase 1, e preencher `WHATSAPP_TEMPLATE_CANCELLATION_NAME` no `.env`.

## Ordem de prioridade

1. **Fase 1** — sem isso, a promessa central do produto (reduzir faltas via
   lembrete automático) pode simplesmente não entregar mensagem nenhuma em
   produção real. Bloqueia lançamento.
2. **Fase 2** — falha de segurança real e de baixo esforço para corrigir.
   Deve ser resolvida antes do lançamento, mas não compromete a experiência
   do usuário caso o lançamento não possa esperar por ela.
3. **Fase 3** — importante para completude do produto (e para os relatórios
   de faltas que o marketing da landing promete), mas pode ser entregue logo
   após o lançamento; a etapa 1 (marcação manual) é suficiente para um
   primeiro momento.

## Item fora de escopo original ✅ implementado (17/07/2026)

Os dois pontos identificados na análise original — reconhecimento rígido da
confirmação e ambiguidade de qual consulta confirmar — foram implementados:

1. **Reconhecimento da confirmação**: `isConfirmationReply`
   (`src/core/modules/scheduling/domain/confirmation-reply.ts`, testado em
   `confirmation-reply.spec.ts`) substitui a comparação exata por
   tokenização — reconhece "Sim, confirmo!", "ok obrigado", "Confirmado.",
   ignorando acento/pontuação/caixa. Também trata negação: "não vou
   confirmar" ou "cancela" NÃO confirmam, mesmo contendo a palavra
   "confirmar" — evita o risco de confirmar por engano quando o paciente na
   verdade está recusando.
2. **Ambiguidade de qual consulta confirmar**: `ConfirmationLookup` passou a
   retornar TODAS as consultas pendentes do telefone (não só a mais
   próxima). `ConfirmAppointmentFromWhatsAppUseCase` agora: confirma
   normalmente se houver exatamente uma; não confirma nenhuma (e explica por
   quê) se não houver nenhuma; e, se houver mais de uma, **não adivinha** —
   responde ao paciente pedindo para falar com a clínica informando a data,
   usando o novo `WhatsAppMessenger` (texto livre, seguro porque está dentro
   da janela de 24h aberta pela mensagem que o paciente acabou de enviar).

Não implementei uma segunda etapa de desambiguação totalmente automática
(ex.: paciente responder "2" para escolher a segunda consulta da lista) — 
seria necessário reaproveitar a máquina de estados do chatbot
(`ConversationStore`) para guardar "aguardando escolha de consulta", o que é
uma parcela de esforço bem maior para um caso hoje raro (poucos pacientes têm
mais de uma consulta pendente ao mesmo tempo). Fica como evolução futura se
isso se mostrar frequente na prática.
