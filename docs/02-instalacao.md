# Instalação e execução

## Pré-requisitos

- **Node.js 20+** e npm
- **PostgreSQL** (recomendado: [Neon](https://neon.tech) — serverless)
- Contas/credenciais opcionais para integrações: Stripe (ou outro gateway),
  Meta WhatsApp Cloud API, Upstash QStash, provedor SMTP.

## Passo a passo

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env   # se não existir, crie .env (veja docs/03-variaveis-de-ambiente.md)

# 3. Aplicar o schema no banco
#    Em dev, o caminho mais simples é o push do Drizzle:
npx drizzle-kit push

# 4. Rodar em desenvolvimento
npm run dev            # http://localhost:3000
```

## Scripts disponíveis

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Next.js) |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint |
| `npm run test` | Testes (Vitest, uma vez) |
| `npm run test:watch` | Testes em watch |

## Migrações de banco

O projeto usa **Drizzle ORM**. O schema canônico é `src/db/schema.ts`.

- **Desenvolvimento:** `npx drizzle-kit push` aplica o schema diretamente. É o
  fluxo recomendado, porque o banco foi criado por *push* (não há histórico de
  migrações versionadas confiável para `migrate`).
- **Produção (Neon):** as alterações de schema também são entregues como
  **SQL idempotente** em `drizzle/manual/`. Abra o **SQL Editor do Neon**, cole o
  conteúdo do arquivo da fase correspondente e rode. Esses scripts usam
  `IF NOT EXISTS`/guards, então são seguros para reexecução e para linhas já
  existentes.

Arquivos manuais já disponíveis em `drizzle/manual/`:

```
apply-prontuario.sql                       # prontuário (antecedentes, diagnósticos...)
apply-fase-0-1.sql                         # papéis (RBAC) + auditoria
apply-fase-2-clinic-type.sql               # tipo de clínica
apply-fase-5-patient-portal.sql            # patients.user_id (portal)
apply-fase-6-status-notifications.sql      # status de agendamento + notificações
apply-fase-6-chatbot-conversations.sql     # conversas do chatbot
apply-refino-whatsapp-multitenant.sql      # clinics.whatsapp_phone_number_id
apply-fase-8-platform-admin.sql            # status + override de plano por clínica
```

> **Ordem de aplicação:** se for montar um ambiente do zero, prefira
> `npx drizzle-kit push` (aplica tudo de uma vez a partir do schema). Os SQLs
> manuais existem para aplicar **incrementos** num banco que já está em produção.

## Primeiro acesso

1. Crie sua conta em `/auth` (e-mail/senha ou Google).
2. Cadastre a clínica em `/clinic-form` (escolha o **tipo** — isso ajusta os
   rótulos da interface, ex.: "Médicos" vira "Dentistas").
3. Assine um plano em `/new-subscription` (necessário para liberar o painel).
4. O **admin de plataforma** (você, operador do SaaS) é definido pelo campo
   `platform_role = 'platform_admin'` no usuário (veja
   [gestão e operação](07-gestao-e-operacao.md)).
