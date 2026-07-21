# Variáveis de ambiente

Todas as integrações degradam com elegância: **sem credenciais, o recurso opera
em "modo dev"** (ex.: WhatsApp e lembretes apenas logam no console em vez de
enviar de verdade). Isso permite rodar o app localmente sem configurar tudo.

## Essenciais

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL (ex.: Neon). **Obrigatória.** |
| `NEXT_PUBLIC_APP_URL` | URL pública do app (ex.: `https://app.m-agendy.com`). Usada em redirects e checkout. |
| `APP_URL` | URL base usada no backend (ex.: link público de agendamento enviado ao paciente). |

## Autenticação (BetterAuth)

| Variável | Descrição |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Login social com Google (opcional). |

## Pagamentos / Assinatura

| Variável | Descrição |
|---|---|
| `PAYMENT_GATEWAY` | Gateway ativo. Default `stripe`. Futuro: `pagarme`, `mercadopago`. |
| `STRIPE_SECRET_KEY` | Chave secreta da Stripe. |
| `STRIPE_WEBHOOK_SECRET` | Segredo para validar a assinatura do webhook da Stripe. |
| `STRIPE_PREMIUM_PLAN_PRICE_ID` | ID do preço do plano premium (Stripe). |
| `STRIPE_ESSENTIAL_PLAN_PRICE_ID` | ID do preço do plano essential (opcional, para planos pagos). |
| `STRIPE_GOLD_PLAN_PRICE_ID` | ID do preço do plano gold (opcional). |
| `NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL` | URL do portal de gestão de assinatura (Stripe). |

> Ao adicionar um novo gateway, defina as variáveis dele aqui e selecione com
> `PAYMENT_GATEWAY`. Veja [conectando gateways](06-gateways-de-pagamento.md).

## WhatsApp (Meta Cloud API)

| Variável | Descrição |
|---|---|
| `WHATSAPP_API_URL` | Base da Graph API (ex.: `https://graph.facebook.com/v20.0`). |
| `WHATSAPP_PHONE_NUMBER_ID` | ID do número remetente (envio de mensagens). |
| `WHATSAPP_ACCESS_TOKEN` | Token de acesso da Meta. |
| `WHATSAPP_VERIFY_TOKEN` | Token do handshake de verificação do webhook (GET). |
| `WHATSAPP_APP_SECRET` | App secret para validar a assinatura `X-Hub-Signature-256` (POST). |
| `WHATSAPP_DEFAULT_CLINIC_ID` | Clínica padrão quando o número recebido não está mapeado (fallback do roteamento multi-tenant). |
| `WHATSAPP_TEMPLATE_LANGUAGE` | Código de idioma do template na Meta (default `pt_BR`). |
| `WHATSAPP_TEMPLATE_CONFIRMATION_NAME` | Nome do template aprovado no WhatsApp Manager para a confirmação imediata de agendamento. Sem ele, a confirmação cai em modo dev mesmo com as demais credenciais preenchidas — ver [docs/11](11-plano-notificacoes-whatsapp.md). |
| `WHATSAPP_TEMPLATE_REMINDER_NAME` | Nome do template aprovado no WhatsApp Manager para o lembrete (24h/2h antes). Mesma regra acima. |
| `WHATSAPP_TEMPLATE_CANCELLATION_NAME` | Nome do template aprovado no WhatsApp Manager para o aviso de cancelamento. Mesma regra acima. |

## Lembretes (fila)

| Variável | Descrição |
|---|---|
| `QSTASH_TOKEN` | Token do Upstash QStash (agenda HTTP atrasado para os lembretes). |
| `QSTASH_URL` | Endpoint da região do QStash (console da Upstash). O QStash tem instâncias regionais (EU/US); sem esta variável, o adapter usa o alias padrão `https://qstash.upstash.io`, que é a região **EU**. Se o seu token foi criado na região **US**, preencha com `https://qstash-us-east-1.upstash.io` — do contrário os agendamentos vão para a região errada e nada é entregue. |
| `REMINDER_DISPATCH_URL` | URL do **próprio** endpoint do M.Agendy (`/api/reminders/dispatch`) — não vem do console da Upstash, é você quem define. Em produção, use o domínio real (`https://seu-dominio.com/api/reminders/dispatch`), nunca uma URL de preview. |
| `QSTASH_CURRENT_SIGNING_KEY` / `QSTASH_NEXT_SIGNING_KEY` | Chaves de assinatura do QStash (console da Upstash), validam o header `Upstash-Signature` em `/api/reminders/dispatch`. Sem elas, o endpoint aceita qualquer requisição (modo dev) — ver [docs/11](11-plano-notificacoes-whatsapp.md). |

## E-mail (SMTP / contato)

| Variável | Descrição |
|---|---|
| `EMAIL_SERVICE` | Serviço (ex.: `gmail`) — ou use os campos SMTP abaixo. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | Configuração SMTP. |
| `EMAIL_USER` / `EMAIL_PASS` | Credenciais do remetente. |
| `EMAIL_FROM_NAME` | Nome exibido como remetente. |
| `CONTACT_EMAIL` | Destino do formulário de contato. |

Detalhes de e-mail em `EMAIL_SETUP.md` (na raiz).

## Testes (integração e E2E)

| Variável | Descrição |
|---|---|
| `TEST_DATABASE_URL` | Postgres de TESTE (nunca aponte para dev/produção). Exigida por `npm run test:integration` e pelo `global-setup` do Playwright — os testes fazem `TRUNCATE` entre casos. Ver `docs/10-estrategia-de-testes.md`. |
| `E2E_BASE_URL` | URL onde o Playwright espera o app rodando (default `http://localhost:3000`). Útil para rodar os E2E contra um preview deploy em vez de subir o servidor localmente. |
