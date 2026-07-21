# 🏥 M.Agendy

[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-gray?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-white?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-black?style=for-the-badge&logo=postgresql)](https://postgresql.org/)

> SaaS de **gestão de agendamentos inteligente** e **prontuário eletrônico** para
> clínicas e consultórios de qualquer segmento — médico, odontológico,
> fisioterapia, nutrição, psicologia e mais.

Resolve as dores de quem vive de agenda: **buracos na agenda, faltas de pacientes
e sobrecarga manual da recepção** — com agendamento online pelo paciente, chatbot
e confirmações por WhatsApp, lembretes automáticos e prontuário seguro.

## ✨ Funcionalidades

- **Agendamento** pelo painel e **online pelo paciente** (link público, sem login),
  com identificação de **consulta ou retorno**.
- **Chatbot de WhatsApp** que agenda em conversa, e **confirmação** de consultas
  por WhatsApp com aviso in-app para a clínica.
- **Lembretes automáticos** (reduzem faltas) via fila (QStash).
- **Prontuário eletrônico**: antecedentes, diagnósticos, prescrições,
  atendimentos, acompanhamentos e histórico — com **auditoria de acesso (LGPD)**.
- **Multi-clínica / multi-tenant** com **papéis e permissões** (RBAC).
- **Assinaturas** com gateway de pagamento **trocável** (Stripe hoje; preparado
  para Pagar.me / Mercado Pago).
- Multi-segmento: a interface adapta os rótulos ao tipo da clínica.
- **Área de administração da plataforma** (`/platform`) separada do painel da
  clínica: gerir clínicas (com provisionamento automático do responsável ao
  criar), bloquear/liberar acesso e conceder planos de cortesia.

## 🛠️ Tecnologias

Next.js 16 (App Router) · TypeScript · Tailwind CSS · ShadCN/ui · React Hook Form
· Zod · BetterAuth · PostgreSQL · Drizzle ORM · next-safe-action · Day.js ·
Framer Motion · Vitest. Integrações: Meta WhatsApp Cloud API, Upstash QStash,
Stripe, SMTP.

## 🏗️ Arquitetura

Monólito Next.js com **Arquitetura Hexagonal (Ports & Adapters)** e DDD. A regra
de negócio (`src/core`) é independente do framework; o Next.js é só a camada de
entrega. Isso torna o sistema testável e permite trocar fornecedores (banco,
mensageria, fila, **gateway de pagamento**) mexendo só num adapter.

```
delivery (app/actions) → application (use cases + ports) → domain (regras puras)
                              ↓
                       infra (adapters: Drizzle, WhatsApp, QStash, Stripe)
```

Detalhes em **[docs/01-arquitetura.md](docs/01-arquitetura.md)**.

## 🚀 Como executar

```bash
npm install
cp .env.example .env          # configure as variáveis (veja docs)
npx drizzle-kit push          # aplica o schema no banco
npm run dev                   # http://localhost:3000
```

Guia completo: **[docs/02-instalacao.md](docs/02-instalacao.md)** ·
Variáveis: **[docs/03-variaveis-de-ambiente.md](docs/03-variaveis-de-ambiente.md)**.

## 📜 Scripts

`npm run dev` · `npm run build` · `npm run start` · `npm run lint` ·
`npm run test` · `npm run test:watch`

## 📚 Documentação

| Documento                                                                 | Conteúdo                                                 |
| ------------------------------------------------------------------------- | -------------------------------------------------------- |
| [Arquitetura](docs/01-arquitetura.md)                                     | Camadas, módulos, estrutura de pastas                    |
| [Instalação](docs/02-instalacao.md)                                       | Setup, scripts, migrações (Neon)                         |
| [Variáveis de ambiente](docs/03-variaveis-de-ambiente.md)                 | Todas as envs                                            |
| [Fluxos](docs/04-fluxos.md)                                               | Auth, agendamento, WhatsApp, prontuário, billing         |
| [Desenvolvimento](docs/05-desenvolvimento.md)                             | Convenções e como criar uma feature                      |
| [Gateways de pagamento](docs/06-gateways-de-pagamento.md)                 | Conectar Pagar.me / Mercado Pago                         |
| [Gestão e operação](docs/07-gestao-e-operacao.md)                         | RBAC, admin, LGPD, multi-tenant                          |
| [Administração da plataforma e planos](docs/08-administracao-e-planos.md) | Área /platform, bloqueio de clínicas, catálogo de planos |
| [Changelog](CHANGELOG.md)                                                 | Histórico de correções e mudanças relevantes             |

## 🗂️ Estrutura (resumo)

```
src/
├── app/          # rotas (painel, agendamento público, portal, api/webhooks)
├── actions/      # Server Actions (cascas finas + schemas Zod)
├── core/         # núcleo hexagonal (domain / application / infra) por módulo
├── components/   # ShadCN/ui
├── db/           # schema Drizzle + client
└── lib/          # BetterAuth, next-safe-action
```

## 🧪 Testes

Vitest cobre domínio e casos de uso com fakes das portas (sem banco/HTTP):
`npm run test`.

## 📄 Licença

Veja [LICENSE](LICENSE).
