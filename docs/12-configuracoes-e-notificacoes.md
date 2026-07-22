# Configurações e notificações

Contexto: um raio-x pedido pelo Matheus encontrou vários itens da tela
Configurações e do header que pareciam funcionar (toggle, botão, seletor) mas
não tinham nenhum efeito real — o valor era só descartado no servidor
(`...otherSettings` + `console.log`) ou o botão não tinha handler nenhum.
Este documento registra o que foi corrigido, o que foi removido e por quê, e
o que ficou de fora deliberadamente.

## Sino de notificações no header

`app-header.tsx` tinha um `<Bell />` sem `onClick`, sem `Link` e sem contagem
— 100% decorativo. Agora reaproveita o mesmo padrão já usado no menu lateral
(`app-sidebar.tsx`): vira um `Link` para `/notifications` e mostra um badge
com `countUnreadNotifications` (mesma Server Action), atualizado a cada 60s e
a cada troca de rota. Os itens "Perfil"/"Configurações" do menu da conta,
que também não navegavam para lugar nenhum, agora apontam para `/settings`
(não existe uma página de perfil separada).

## Notificações → o que existia e não fazia nada

O `updateSettings` (`src/actions/update-settings/index.ts`) recebia 10
campos, mas só persistia 4 (`name`, `email`, `phoneNumber`, `clinicName`); os
outros 6 (`language`, `timezone`, `emailNotifications`, `smsNotifications`,
`appointmentReminders`, `marketingEmails`) eram destruturados para
`...otherSettings` e só apareciam num `console.log`. O formulário também
sempre carregava os mesmos valores fixos no `defaultValues` (ex.:
`appointmentReminders: true`), então nem exibia corretamente o que estava
salvo — regardless de ter sido salvo ou não, sempre mostrava o mesmo valor.

**SMS**: removido (schema e UI) — não existe canal de SMS na aplicação.

**Notificações por Email / 2FA / Timeout de Sessão**: removidos pelo mesmo
motivo (decisão do Matheus): não existe canal de e-mail de notificação
separado do WhatsApp, e o BetterAuth configurado aqui não tem plugin de 2FA
nem controle de timeout de sessão custom. Preferimos não mostrar controles
que não fazem nada a fingir que fazem.

**Lembretes de Agendamento** (`appointmentReminders`): agora é uma
configuração real, por clínica — `clinics.appointment_reminders_enabled`
(default `true`). `ScheduleAppointmentUseCase`, `BookAppointmentUseCase` e
`UpsertAppointmentUseCase` passam a consultar uma nova porta
`ClinicReminderPreference` antes de enfileirar os lembretes de 24h/2h; a
confirmação imediata do agendamento continua saindo normalmente — só os
lembretes futuros são suprimidos quando a clínica desliga o toggle.

**Emails de Marketing** (`marketingEmails`): opt-in real, por usuário —
`users.marketing_emails_opt_in` (default `false`). Além de persistir o
toggle, foi criado o módulo `core/modules/marketing` com uma ferramenta para
o admin da plataforma efetivamente disparar novidades/promoções: página
`/platform/marketing-emails`, `SendMarketingEmailUseCase` (restrito a
`platform_admin`, envio best-effort por destinatário — uma falha isolada não
derruba o disparo todo) e um novo template de e-mail
(`createMarketingEmailTemplate` em `src/lib/email.ts`) reaproveitando o
mesmo `sendEmail`/Nodemailer já usado para verificação e redefinição de
senha. O público é quem deu opt-in (`usersTable.marketingEmailsOptIn`), não
os pacientes das clínicas.

## Segurança → "Alterar Senha" não fazia nada

O card tinha 3 campos de senha e um botão sem `onClick`. Extraído para
`ChangePasswordCard` (`settings/_components/change-password-card.tsx`), com
RHF + Zod (confirmação de senha validada com `.refine`) chamando
`authClient.changePassword` do BetterAuth (`revokeOtherSessions: true`).

## Preferências → Idioma e Fuso Horário removidos (por enquanto)

Os dois seletores existiam na UI mas não tinham nenhuma infraestrutura por
trás: não há biblioteca de i18n no projeto (a interface inteira é hardcoded
em português), e o fuso horário é uma constante única (`CLINIC_TIMEZONE`)
usada em todo o motor de agendamento (disponibilidade, lembretes, janelas de
dia) — trocar isso de verdade é um projeto à parte, não um ajuste de tela.
Decisão do Matheus: remover os seletores agora em vez de deixar algo que
parece funcionar e não funciona; a aparência (claro/escuro) continua, pois já
era real. Se/quando fizer sentido priorizar i18n completo ou fuso por
clínica, isso deve ser tratado como uma feature própria.

## Migração

`drizzle/manual/apply-notification-preferences.sql` — adiciona
`clinics.appointment_reminders_enabled` e `users.marketing_emails_opt_in`,
idempotente (cole no SQL Editor do Neon e rode).
