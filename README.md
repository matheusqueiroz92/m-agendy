# 🏥 M.Agendy - Sistema de Gestão para Clínicas Médicas

[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-white?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-gray?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-black?style=for-the-badge&logo=postgresql)](https://postgresql.org/)

> **Sistema completo de gestão para clínicas médicas com agendamentos inteligentes, controle de pacientes, médicos e muito mais.**

## 📋 Índice

- [🎯 Sobre o Projeto](#-sobre-o-projeto)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [🏗️ Arquitetura](#️-arquitetura)
- [🚀 Como Executar](#-como-executar)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🔄 Fluxos Principais](#-fluxos-principais)
- [💡 Implementações Avançadas](#-implementações-avançadas)
- [🔮 Roadmap](#-roadmap)
- [🤝 Contribuição](#-contribuição)

## 🎯 Sobre o Projeto

O **M.Agendy** é uma solução moderna e completa para gestão de clínicas médicas, desenvolvida com foco em **performance**, **experiência do usuário** e **integridade de dados**. O sistema oferece controle total sobre pacientes, médicos e agendamentos, com recursos avançados como **prevenção de conflitos** e **cache inteligente**.

### 🎪 **Principais Diferenciais:**

- 🚫 **Zero conflitos** de agendamento
- ⚡ **Cache inteligente** com React Query
- 🎨 **Interface moderna** com ShadCN/ui
- 🔒 **Autenticação robusta** com BetterAuth
- 📱 **Design responsivo** e acessível
- 🛡️ **Type-safety** com TypeScript

## ✨ Funcionalidades

### 👥 **Gestão de Pacientes**

- ✅ Cadastro completo de pacientes
- ✅ Edição e exclusão de registros
- ✅ Busca e filtros avançados
- ✅ Validação de dados com máscara de telefone
- ✅ Controle de gênero e informações pessoais

### 👨‍⚕️ **Gestão de Médicos**

- ✅ Cadastro de médicos com especialidades
- ✅ Configuração de horários de trabalho
- ✅ Definição de dias disponíveis na semana
- ✅ Valores de consulta personalizados
- ✅ Controle de agenda individual

### 📅 **Sistema de Agendamentos Inteligente**

- ✅ **Prevenção automática de conflitos**
- ✅ **Horários dinâmicos** baseados na disponibilidade
- ✅ **Cache otimizado** para performance
- ✅ Validação de dias de trabalho do médico
- ✅ Interface intuitiva com feedback em tempo real
- ✅ Auto-preenchimento de valores

### 🔐 **Autenticação e Autorização**

- ✅ Login seguro com BetterAuth
- ✅ Gestão de sessões
- ✅ Controle de acesso por clínica
- ✅ Proteção de rotas

### 🎨 **Interface e UX**

- ✅ Design system com ShadCN/ui
- ✅ Modo escuro/claro
- ✅ Componentes reutilizáveis
- ✅ Notificações toast
- ✅ Estados de loading
- ✅ Feedback visual em tempo real

## 🛠️ Tecnologias

### **💻 Frontend**

- **[Next.js 15](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilização utilitária
- **[ShadCN/ui](https://ui.shadcn.com/)** - Componentes de UI
- **[React Hook Form](https://react-hook-form.com/)** - Gerenciamento de formulários
- **[Zod](https://zod.dev/)** - Validação de schemas
- **[React Query](https://tanstack.com/query)** - Cache e sincronização de dados
- **[React Number Format](https://s-yadav.github.io/react-number-format/)** - Máscaras de input

### **🗄️ Backend**

- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Server Actions
- **[BetterAuth](https://better-auth.com/)** - Autenticação
- **[Drizzle ORM](https://orm.drizzle.team/)** - Object-Relational Mapping
- **[PostgreSQL](https://postgresql.org/)** - Banco de dados relacional
- **[Next Safe Action](https://next-safe-action.dev/)** - Server Actions tipadas

### **⚡ Ferramentas de Desenvolvimento**

- **[ESLint](https://eslint.org/)** - Linting de código
- **[Prettier](https://prettier.io/)** - Formatação de código
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Migrações de banco

## 🏗️ Arquitetura

### **📐 Padrões Arquiteturais**

- **App Router** do Next.js 15
- **Server Components** e **Client Components**
- **Server Actions** para operações de dados
- **Clean Architecture** com separação de responsabilidades
- **Component-driven development**

### **🔄 Fluxo de Dados**

```mermaid
graph TD
    A[Client Component] --> B[React Query]
    B --> C[Server Action]
    C --> D[Drizzle ORM]
    D --> E[PostgreSQL]
    E --> D
    D --> C
    C --> B
    B --> A
```

### **🗂️ Estrutura de Camadas**

```
┌─────────────────┐
│   UI Components │  ← ShadCN/ui + Tailwind
├─────────────────┤
│   React Hooks   │  ← React Query + Custom Hooks
├─────────────────┤
│  Server Actions │  ← Business Logic + Validation
├─────────────────┤
│   Data Layer    │  ← Drizzle ORM + Type Safety
├─────────────────┤
│   Database      │  ← PostgreSQL
└─────────────────┘
```

## 🚀 Como Executar

### **📋 Pré-requisitos**

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### **⚙️ Instalação**

1. **Clone o repositório:**

```bash
git clone https://github.com/seu-usuario/m-agendy.git
cd m-agendy
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure as variáveis de ambiente:**

```bash
cp .env.example .env.local
```

4. **Configure o banco de dados no `.env.local`:**

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/magendy"
BETTER_AUTH_SECRET="seu-secret-super-seguro"
BETTER_AUTH_URL="http://localhost:3000"
```

5. **Execute as migrações:**

```bash
npm run db:push
```

6. **Inicie o servidor de desenvolvimento:**

```bash
npm run dev
```

7. **Acesse a aplicação:**

```
http://localhost:3000
```

### **🔧 Scripts Disponíveis**

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificar código
npm run db:generate  # Gerar migrações
npm run db:push      # Aplicar migrações
npm run db:studio    # Interface do banco
```

## 📁 Estrutura do Projeto

```
src/
├── app/                          # App Router do Next.js
│   ├── (protected)/             # Rotas protegidas
│   │   ├── appointments/        # Gestão de agendamentos
│   │   ├── doctors/            # Gestão de médicos
│   │   ├── patients/           # Gestão de pacientes
│   │   └── layout.tsx          # Layout das rotas protegidas
│   ├── actions/                # Server Actions
│   │   ├── upsert-appointment/ # CRUD de agendamentos
│   │   ├── get-available-time-slots/ # Horários disponíveis
│   │   └── ...                 # Outras actions
│   └── auth/                   # Autenticação
├── components/                  # Componentes reutilizáveis
│   └── ui/                     # Componentes ShadCN/ui
├── db/                         # Configuração do banco
│   ├── schema.ts              # Schema Drizzle
│   └── index.ts               # Configuração da conexão
├── hooks/                      # Custom Hooks
│   ├── use-available-time-slots.ts # Cache de horários
│   └── use-invalidate-appointments.ts # Invalidação de cache
├── lib/                        # Utilitários
│   ├── auth.ts                # Configuração BetterAuth
│   └── utils.ts               # Funções utilitárias
└── providers/                  # Context Providers
    └── query-provider.tsx     # React Query Provider
```

## 🔄 Fluxos Principais

### **📅 Criação de Agendamento**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Formulário
    participant RQ as React Query
    participant SA as Server Action
    participant DB as Database

    U->>F: Seleciona paciente
    U->>F: Seleciona médico
    F->>RQ: Busca horários disponíveis
    RQ->>SA: getAvailableTimeSlots
    SA->>DB: Consulta agendamentos existentes
    DB->>SA: Retorna dados
    SA->>RQ: Horários livres
    RQ->>F: Atualiza interface
    F->>U: Mostra apenas horários disponíveis
    U->>F: Seleciona horário
    U->>F: Confirma agendamento
    F->>SA: upsertAppointment
    SA->>DB: Salva agendamento
    SA->>F: Sucesso
    F->>RQ: Invalida cache
    F->>U: Feedback de sucesso
```

### **⚡ Sistema de Cache**

O sistema utiliza **React Query** para otimização de performance:

- **🔑 Cache Key**: `['available-time-slots', doctorId, date]`
- **⏱️ Stale Time**: 2 minutos (dados críticos)
- **🗑️ GC Time**: 5 minutos
- **🔄 Invalidação**: Automática após CRUD de agendamentos

## 💡 Implementações Avançadas

### **🚫 Prevenção de Conflitos**

O sistema **garante zero conflitos** através de:

1. **Validação Server-Side**: Server Action verifica disponibilidade
2. **Cache Inteligente**: React Query mantém dados atualizados
3. **Interface Dinâmica**: Horários ocupados não aparecem
4. **Invalidação Automática**: Cache atualizado após mudanças

### **🎯 Horários Dinâmicos**

```typescript
// Geração automática de slots baseada no médico
function generateTimeSlots(startTime: string, endTime: string): string[] {
  // Gera slots de 30 em 30 minutos
  // Considera horários de trabalho do médico
  // Remove slots já ocupados
}
```

### **🔒 Type Safety**

- **100% TypeScript** em todo o codebase
- **Zod schemas** para validação runtime
- **Drizzle ORM** com tipos inferidos
- **Server Actions** tipadas com Next Safe Action

### **🎨 Design System**

- **Componentes ShadCN/ui** customizados
- **Tailwind CSS** para consistência visual
- **Variáveis CSS** para temas
- **Responsividade** mobile-first

## 🔮 Roadmap

### **🚀 Versão 2.0 - Próximas Funcionalidades**

#### **📊 Dashboard e Analytics**

- [ ] Dashboard administrativo com métricas
- [ ] Relatórios de agendamentos
- [ ] Gráficos de ocupação dos médicos
- [ ] Análise de receita por período

#### **📱 Notificações e Comunicação**

- [ ] Sistema de notificações em tempo real
- [ ] SMS/Email de confirmação de agendamentos
- [ ] Lembretes automáticos para pacientes
- [ ] WhatsApp API integration

#### **💰 Gestão Financeira**

- [ ] Controle de pagamentos
- [ ] Histórico financeiro por paciente
- [ ] Relatórios de faturamento
- [ ] Integração com gateways de pagamento

#### **🏥 Funcionalidades Clínicas**

- [ ] Prontuário eletrônico
- [ ] Receituário digital
- [ ] Exames e resultados
- [ ] Histórico médico completo

#### **🔧 Integrações e APIs**

- [ ] API REST pública
- [ ] Integração com sistemas de planos de saúde
- [ ] Backup automático na nuvem
- [ ] Sincronização multi-clínicas

#### **⚡ Performance e Escalabilidade**

- [ ] Server-side rendering otimizado
- [ ] Lazy loading de componentes
- [ ] PWA (Progressive Web App)
- [ ] Offline-first capabilities

#### **🔐 Segurança Avançada**

- [ ] Two-factor authentication (2FA)
- [ ] Logs de auditoria completos
- [ ] LGPD compliance
- [ ] Criptografia end-to-end

### **🛠️ Melhorias Técnicas**

#### **🧪 Qualidade de Código**

- [ ] Testes unitários (Jest + Testing Library)
- [ ] Testes de integração (Cypress)
- [ ] Testes E2E automatizados
- [ ] Coverage reports

#### **🚀 DevOps e Deploy**

- [ ] CI/CD pipeline completo
- [ ] Docker containerization
- [ ] Deploy automático (Vercel/AWS)
- [ ] Monitoring e observabilidade

#### **📚 Documentação**

- [ ] Documentação técnica completa
- [ ] Storybook para componentes
- [ ] API documentation (Swagger)
- [ ] Guias de contribuição

### **🎯 Roadmap por Prioridade**

#### **Alta Prioridade (Q1 2025)**

1. Dashboard e métricas básicas
2. Sistema de notificações
3. Testes automatizados
4. API REST

#### **Média Prioridade (Q2 2025)**

1. Gestão financeira
2. Prontuário eletrônico
3. PWA implementation
4. Integração WhatsApp

#### **Baixa Prioridade (Q3-Q4 2025)**

1. Multi-tenancy
2. Integrações avançadas
3. IA para otimização de agenda
4. Telemedicina

## 🤝 Contribuição

### **🎯 Como Contribuir**

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### **📝 Diretrizes de Código**

- Siga os **padrões ESLint** configurados
- Use **TypeScript** para toda nova funcionalidade
- Escreva **testes** para código crítico
- Mantenha **componentes pequenos** e reutilizáveis
- Use **convenções de nomenclatura** consistentes

### **🐛 Reportando Bugs**

Use as **[Issues](https://github.com/seu-usuario/m-agendy/issues)** para reportar bugs, seguindo o template:

```markdown
**Descrição do Bug**
Descrição clara do que está acontecendo

**Reprodução**
Passos para reproduzir o comportamento

**Comportamento Esperado**
O que você esperava que acontecesse

**Screenshots**
Adicione screenshots se aplicável

**Ambiente**

- OS: [ex: Windows 10]
- Browser: [ex: Chrome 120]
- Versão: [ex: 2.0.1]
```

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**Desenvolvido com ❤️ para modernizar a gestão de clínicas médicas**

---

<div align="center">

### 🌟 **Se este projeto te ajudou, considere dar uma estrela!** ⭐

[![GitHub stars](https://img.shields.io/github/stars/seu-usuario/m-agendy?style=social)](https://github.com/seu-usuario/m-agendy/stargazers)

</div>
