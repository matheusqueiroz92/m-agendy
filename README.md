# 🏥 M.Agendy - Sistema de Gestão para Clínicas Médicas

[![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-white?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-gray?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-black?style=for-the-badge&logo=postgresql)](https://postgresql.org/)

> **Sistema completo de gestão para clínicas médicas com agendamentos inteligentes, controle de pacientes, médicos e dashboard avançado com analytics.**

## 📋 Índice

- [🎯 Sobre o Projeto](#-sobre-o-projeto)
- [✨ Funcionalidades](#-funcionalidades)
- [🛠️ Tecnologias](#️-tecnologias)
- [🏗️ Arquitetura](#️-arquitetura)
- [🚀 Como Executar](#-como-executar)
- [📁 Estrutura do Projeto](#-estrutura-do-projeto)
- [🔄 Fluxos Principais](#-fluxos-principais)
- [💡 Implementações Avançadas](#-implementações-avançadas)
- [🆕 Novas Funcionalidades](#-novas-funcionalidades)
- [🔮 Roadmap](#-roadmap)
- [🤝 Contribuição](#-contribuição)

## 🎯 Sobre o Projeto

O **M.Agendy** é uma solução moderna e completa para gestão de clínicas médicas, desenvolvida com foco em **performance**, **experiência do usuário** e **integridade de dados**. O sistema oferece controle total sobre pacientes, médicos e agendamentos, com recursos avançados como **prevenção de conflitos**, **cache inteligente** e **dashboard com analytics**.

### 🎪 **Principais Diferenciais:**

- 🚫 **Zero conflitos** de agendamento
- ⚡ **Cache inteligente** com React Query
- 🎨 **Interface moderna** com ShadCN/ui
- 🌙 **Tema dark/light** com transições suaves
- 🔒 **Autenticação robusta** com BetterAuth
- 📊 **Dashboard com métricas** e gráficos interativos
- 📱 **Design responsivo** e acessível
- 🛡️ **Type-safety** com TypeScript

## ✨ Funcionalidades

### 📊 **Dashboard Avançado com Analytics**

- ✅ **Cards de estatísticas** em tempo real
- ✅ **Gráficos de agendamentos** por período
- ✅ **Ranking de médicos** mais ativos
- ✅ **Top especialidades** mais procuradas
- ✅ **Métricas de ocupação** da clínica
- ✅ **Filtros por data** personalizáveis
- ✅ **Visualizações interativas** com Recharts

### 🎨 **Sistema de Temas**

- ✅ **Modo escuro/claro** com toggle intuitivo
- ✅ **Detecção automática** do tema do sistema
- ✅ **Transições suaves** entre temas
- ✅ **Persistência** da preferência do usuário
- ✅ **Componentes otimizados** para ambos os temas
- ✅ **Ícones adaptativos** por tema

### 👥 **Gestão de Pacientes**

- ✅ Cadastro completo de pacientes
- ✅ Edição e exclusão de registros
- ✅ Busca e filtros avançados
- ✅ Validação de dados com máscara de telefone
- ✅ Controle de gênero e informações pessoais

### 👨‍⚕️ **Gestão de Médicos**

- ✅ Cadastro de médicos com especialidades
- ✅ **Campo de telefone opcional** para contato
- ✅ Configuração de horários de trabalho
- ✅ Definição de dias disponíveis na semana
- ✅ Valores de consulta personalizados
- ✅ Controle de agenda individual
- ✅ **Ranking de performance** no dashboard

### 📅 **Sistema de Agendamentos Inteligente**

- ✅ **Prevenção automática de conflitos**
- ✅ **Horários dinâmicos** baseados na disponibilidade
- ✅ **Cache otimizado** para performance
- ✅ Validação de dias de trabalho do médico
- ✅ Interface intuitiva com feedback em tempo real
- ✅ Auto-preenchimento de valores
- ✅ **Gráficos de agendamentos** por período

### 🔐 **Autenticação e Autorização**

- ✅ Login seguro com BetterAuth
- ✅ **Verificação de e-mail** para novos usuários
- ✅ **Login OAuth** (Google/GitHub) com verificação automática
- ✅ **Templates de e-mail** profissionais em português
- ✅ Gestão de sessões
- ✅ Controle de acesso por clínica
- ✅ Proteção de rotas

### 🎨 **Interface e UX**

- ✅ Design system com ShadCN/ui
- ✅ **Modo escuro/claro** com toggle
- ✅ Componentes reutilizáveis
- ✅ Notificações toast
- ✅ Estados de loading
- ✅ Feedback visual em tempo real
- ✅ **Gráficos interativos** com Recharts

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
- **[Next Themes](https://github.com/pacocoursey/next-themes)** - Sistema de temas
- **[Recharts](https://recharts.org/)** - Gráficos e visualizações

### **🗄️ Backend**

- **[Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)** - Server Actions
- **[BetterAuth](https://better-auth.com/)** - Autenticação
- **[Nodemailer](https://nodemailer.com/)** - Envio de e-mails
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

4. **Configure o banco de dados e e-mail no `.env.local`:**

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/magendy"

# Auth
BETTER_AUTH_SECRET="seu-secret-super-seguro"
BETTER_AUTH_URL="http://localhost:3000"

# Email Configuration (opcional - apenas para verificação de e-mail)
EMAIL_SERVICE="gmail"
EMAIL_USER="seu-email@gmail.com"
EMAIL_PASS="sua-senha-de-app"
EMAIL_FROM_NAME="M.Agendy"
```

> **📧 Configuração de E-mail:** Para habilitar a verificação de e-mail, consulte o arquivo [EMAIL_SETUP.md](./EMAIL_SETUP.md) para instruções detalhadas.

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

## 🆕 Novas Funcionalidades

### 🎨 **Sistema de Temas Dark/Light**

**Implementação completa** de sistema de temas com:

- **🌙 Toggle intuitivo** no header da aplicação
- **🔄 Detecção automática** do tema do sistema operacional
- **💾 Persistência** da preferência do usuário
- **⚡ Transições suaves** entre temas
- **🎯 Compatibilidade total** com todos os componentes

```typescript
// Exemplo de uso do sistema de temas
import { ThemeToggle } from '@/components/theme-toggle'

export function AppHeader() {
  return (
    <header>
      <ThemeToggle />
    </header>
  )
}
```

### 📊 **Dashboard com Analytics**

**Dashboard completamente renovado** com métricas avançadas:

#### **📈 Cards de Estatísticas**

- **Total de agendamentos** do período
- **Pacientes ativos** cadastrados
- **Médicos disponíveis** na clínica
- **Taxa de ocupação** em tempo real

#### **📊 Gráficos Interativos**

- **Gráfico de agendamentos** por período (últimos 30 dias)
- **Visualização por barras** com dados dinâmicos
- **Cores adaptáveis** ao tema atual
- **Tooltips informativos** ao passar o mouse

#### **🏆 Ranking de Médicos**

- **Top médicos** mais ativos
- **Quantidade de agendamentos** por médico
- **Especialidades** mais procuradas
- **Interface clean** com avatares

#### **🎯 Top Especialidades**

- **Ranking das especialidades** mais agendadas
- **Percentual de ocupação** por especialidade
- **Dados em tempo real** atualizados automaticamente

### 📅 **Melhorias no Sistema de Agendamentos**

- **🔒 Validação aprimorada** de dias disponíveis do médico
- **⚡ Performance otimizada** no carregamento de horários
- **🎨 Interface mais intuitiva** com melhor UX
- **📱 Responsividade aprimorada** em dispositivos móveis

### 📧 **Sistema de Verificação de E-mail**

**Nova implementação completa** de verificação de e-mail para segurança:

#### **✉️ Funcionalidades de E-mail**

- **📨 Envio automático** de e-mail de verificação para novos usuários
- **🎨 Template profissional** em português com design responsivo
- **🔐 Verificação obrigatória** apenas para registro por e-mail/senha
- **⚡ OAuth inteligente** - Google/GitHub com verificação automática
- **🔄 Link de verificação** com expiração de 24 horas
- **📱 Interface responsiva** para verificação

#### **🛠️ Tecnologias Utilizadas**

- **Nodemailer** para envio de e-mails
- **Better Auth** com verificação integrada
- **Templates HTML** responsivos
- **Suporte Gmail** e SMTP genérico

#### **🔄 Fluxo de Verificação**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Formulário
    participant BA as BetterAuth
    participant E as EmailService
    participant V as VerifyPage

    U->>F: Registro por e-mail/senha
    F->>BA: signUp.email()
    BA->>E: Envia e-mail de verificação
    E->>U: E-mail com link
    U->>V: Clica no link
    V->>BA: Verifica token
    BA->>V: Token válido
    V->>U: Redirecionamento para dashboard
```

### 👨‍⚕️ **Melhorias na Gestão de Médicos**

#### **📞 Campo de Telefone Opcional**

- **🔢 Formatação automática** com máscara (##) #####-####
- **✅ Validação inteligente** com React Number Format
- **💾 Armazenamento opcional** no banco de dados
- **🎨 Interface consistente** com outros formulários

### 🎨 **Melhorias na Interface**

#### **🎭 Ícones e Visual**

- **Ícones atualizados** em toda a aplicação
- **Logo personalizada** da clínica
- **Paleta de cores** otimizada para ambos os temas
- **Animações suaves** em transições

#### **📱 Responsividade**

- **Design mobile-first** aprimorado
- **Navegação otimizada** para tablets
- **Touch-friendly** em dispositivos móveis

### ⚡ **Otimizações de Performance**

- **🚀 Lazy loading** de componentes do dashboard
- **💾 Cache inteligente** para métricas
- **🔄 Invalidação automática** de dados desatualizados
- **⚡ Renderização otimizada** dos gráficos

## 🔄 Fluxos Principais

### **📊 Dashboard Analytics**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant D as Dashboard
    participant RQ as React Query
    participant SA as Server Actions
    participant DB as Database

    U->>D: Acessa dashboard
    D->>RQ: Busca métricas
    RQ->>SA: getAppointmentStats
    SA->>DB: Consulta agendamentos
    DB->>SA: Retorna dados
    SA->>RQ: Métricas calculadas
    RQ->>D: Atualiza gráficos
    D->>U: Exibe analytics
```

### **🎨 Sistema de Temas**

```mermaid
sequenceDiagram
    participant U as Usuário
    participant T as ThemeToggle
    participant P as ThemeProvider
    participant LS as LocalStorage

    U->>T: Clica no toggle
    T->>P: setTheme(dark/light)
    P->>LS: Salva preferência
    P->>T: Atualiza interface
    T->>U: Tema aplicado
```

### **🎯 Horários Dinâmicos**

```typescript
// Geração automática de slots baseada no médico com validação de dias
function generateTimeSlots(
  startTime: string,
  endTime: string,
  availableDays: number[],
): string[] {
  // Gera slots de 30 em 30 minutos
  // Considera horários de trabalho do médico
  // Valida dias da semana disponíveis
  // Remove slots já ocupados
}
```

### **📊 Sistema de Analytics**

```typescript
// Geração de métricas do dashboard
function generateDashboardMetrics() {
  return {
    totalAppointments: getTotalAppointments(),
    activePatients: getActivePatients(),
    availableDoctors: getAvailableDoctors(),
    occupancyRate: calculateOccupancyRate(),
    topDoctors: getTopDoctors(),
    topSpecialties: getTopSpecialties(),
    appointmentsByPeriod: getAppointmentsByPeriod(),
  };
}
```

### **🎨 Design System Aprimorado**

- **Componentes ShadCN/ui** customizados e temáticos
- **Tailwind CSS** com variáveis CSS para temas
- **Gráficos responsivos** com Recharts
- **Ícones adaptativos** por tema
- **Responsividade** mobile-first aprimorada

## 🔮 Roadmap

### **🚀 Versão 2.0 - Próximas Funcionalidades**

#### **✅ Concluído (Q4 2024)**

1. ✅ Dashboard com métricas e analytics
2. ✅ Sistema de temas dark/light
3. ✅ Gráficos interativos com Recharts
4. ✅ Ranking de médicos e especialidades
5. ✅ Interface responsiva aprimorada
6. ✅ **Sistema de verificação de e-mail**
7. ✅ **Campo de telefone opcional para médicos**
8. ✅ **Templates de e-mail profissionais**

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

- [x] Server-side rendering otimizado
- [x] Lazy loading de componentes
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

- [x] Documentação técnica completa
- [ ] Storybook para componentes
- [ ] API documentation (Swagger)
- [ ] Guias de contribuição

### **🎯 Roadmap por Prioridade**

#### **✅ Concluído (Q4 2024)**

1. ✅ Dashboard com métricas e analytics
2. ✅ Sistema de temas dark/light
3. ✅ Gráficos interativos com Recharts
4. ✅ Ranking de médicos e especialidades
5. ✅ Interface responsiva aprimorada
6. ✅ **Sistema de verificação de e-mail**
7. ✅ **Campo de telefone opcional para médicos**
8. ✅ **Templates de e-mail profissionais**

#### **Alta Prioridade (Q1 2025)**

1. Sistema de notificações em tempo real
2. Testes automatizados completos
3. API REST pública
4. PWA implementation

#### **Média Prioridade (Q2 2025)**

1. Gestão financeira
2. Prontuário eletrônico
3. Integração WhatsApp
4. Multi-tenancy

#### **Baixa Prioridade (Q3-Q4 2025)**

1. Integrações avançadas com planos de saúde
2. IA para otimização de agenda
3. Telemedicina
4. Sistema de auditoria completo

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
