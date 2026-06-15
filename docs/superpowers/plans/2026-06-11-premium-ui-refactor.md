# M. Agendy — Refatoração UI Premium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a estética genérica/boilerplate da área autenticada por uma interface premium, minimalista e fluida — estilo Linear/Vercel — com hierarquia por whitespace, paleta refinada e micro-copy humana.

**Architecture:** Refatoração em camadas: (1) design tokens globais em CSS variables, (2) primitivos ShadCN reutilizáveis, (3) layout shell (sidebar + header), (4) páginas Dashboard e Agendamentos. Introduzir um componente `PageSection` leve para substituir cards aninhados onde possível, mantendo `Card` apenas para blocos que realmente precisam de contenção visual.

**Tech Stack:** Next.js 15, Tailwind CSS v4 (`@theme inline`), ShadCN/ui (new-york), Geist Sans, oklch color space, Lucide icons.

---

## Diagnóstico do Estado Atual

| Problema | Onde |
|----------|------|
| Paleta ShadCN default (roxo/azul saturado, cinzas neutros frios) | `globals.css` |
| Cardificação excessiva (Card → Separator → CardContent em cascata) | Dashboard, stats, chart, top lists |
| Ícones coloridos em todo header de seção | `stats-cards`, `appointments-chart`, `top-doctors`, `top-specialities` |
| Header de tabela com fundo accent colorido | `data-table.tsx` |
| Hardcoded `gray-100`/`gray-600` | `top-doctors.tsx` |
| Sidebar com `border-b` pesado e labels genéricos ("Menu Principal") | `app-sidebar.tsx` |
| Header com badge de notificação vermelho fixo (visual ruidoso) | `app-header.tsx` |
| Tipografia inconsistente (Manrope no root, sem escala definida) | `layout.tsx`, `page-container.tsx` |
| Micro-copy mecânica / inglês residual | `date-picker.tsx` ("Pick a date"), empty states genéricos |
| `transition-all` em botões (anti-pattern Vercel Guidelines) | `button.tsx` |

**Fora de escopo nesta fase:** Landing page (`src/app/page.tsx`), auth, doctors/patients/settings — podem ser fase 2 após aprovação.

---

## Direção Estética Proposta

### Conceito: *Clinical Precision*
Minimalismo premium inspirado em Linear — precisão, calma, confiança. Sem gradientes, sem sombras pesadas, sem ícones coloridos espalhados. A cor de destaque aparece **apenas** em CTAs primários, item ativo da sidebar e indicadores de dados críticos.

### Paleta (oklch)

| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `--background` | `oklch(0.988 0.002 90)` | `oklch(0.145 0.008 260)` | Fundo principal — off-white quente / grafite profundo |
| `--foreground` | `oklch(0.205 0.012 260)` | `oklch(0.93 0.005 90)` | Texto principal |
| `--muted-foreground` | `oklch(0.52 0.012 260)` | `oklch(0.62 0.012 260)` | Labels, descrições |
| `--border` | `oklch(0 0 0 / 6%)` | `oklch(1 0 0 / 8%)` | Bordas semi-transparentes |
| `--primary` | `oklch(0.42 0.14 245)` | `oklch(0.58 0.16 245)` | Azul médico refinado — **uso cirúrgico** |
| `--muted` | `oklch(0.965 0.003 90)` | `oklch(0.22 0.008 260)` | Fundos sutis de hover/zebra |
| `--sidebar` | `= background` | `= background` | Sidebar integrada ao fundo |
| `--radius` | `0.625rem` (10px) | — | Base; `rounded-xl` containers, `rounded-lg` inputs/botões |

### Tipografia

- **UI:** `Geist Sans` via `next/font/google` — tracking-tight em títulos, escala:
  - Page title: `text-2xl font-semibold tracking-tight`
  - Section title: `text-sm font-medium text-foreground`
  - Stat value: `text-2xl font-semibold tabular-nums tracking-tight`
  - Body/support: `text-sm text-muted-foreground`
- Manter Manrope apenas se houver conflito; preferir Geist para consistência SaaS.

### Componentes Visuais

| Padrão atual | Novo padrão |
|--------------|-------------|
| `<Card>` com ícone colorido + Separator | `<PageSection title="…">` — título + conteúdo, borda inferior fina opcional |
| Stats em 4 cards | Grid de métricas sem borda — divisores verticais `border-r border-border/60` |
| Tabela com header colorido | Header transparente, `text-xs uppercase tracking-wide text-muted-foreground`, hover row sutil |
| Sidebar groups com labels | Nav flat com espaçamento generoso; item ativo = `bg-muted` + barra lateral `primary` 2px |
| Botões `transition-all` | `transition-[color,background-color,box-shadow,opacity] duration-200` |

### Micro-copy (copywriting skill)

| Atual | Proposto |
|-------|----------|
| "Tenha uma visão geral da sua clínica." | "Resumo do período selecionado." |
| "Gerencie os agendamentos da sua clínica" | "Consultas, horários e status em um só lugar." |
| "Menu Principal" (breadcrumb) | "Início" |
| "Pick a date" | "Selecionar período…" |
| "Nenhum agendamento cadastrado!" | "Nenhuma consulta neste período" |
| "Adicione um agendamento ao sistema." | "Crie a primeira consulta para começar." |
| "Sair" | "Encerrar sessão" |

---

## Mapa de Arquivos

### Criar
| Arquivo | Responsabilidade |
|---------|------------------|
| `src/components/ui/page-section.tsx` | Seção leve (title, description, actions, children) — alternativa ao Card |
| `src/components/ui/stat-metric.tsx` | Métrica individual do dashboard (label, value, optional trend) |
| `src/components/ui/nav-item.tsx` | Item de navegação da sidebar (opcional, se extrair de app-sidebar) |

### Modificar — Camada 1: Tokens & Tipografia
| Arquivo | Mudança |
|---------|---------|
| `src/app/globals.css` | Nova paleta oklch, `--radius`, sombras sutis (`--shadow-subtle`), `color-scheme`, utilitários base |
| `src/app/layout.tsx` | Trocar Manrope → Geist Sans; aplicar `antialiased` + `font-feature-settings` |

### Modificar — Camada 2: Primitivos UI
| Arquivo | Mudança |
|---------|---------|
| `src/components/ui/button.tsx` | `rounded-lg`, transições explícitas, hover/focus suaves |
| `src/components/ui/card.tsx` | Borda fina semi-transparente, remover/suavizar `shadow-sm` |
| `src/components/ui/input.tsx` | `rounded-lg`, borda `border-black/[0.08]` |
| `src/components/ui/table.tsx` | Hover row mais sutil, `tabular-nums` em células numéricas |
| `src/components/ui/data-table.tsx` | Remover wrapper border pesado; header neutro |
| `src/components/ui/page-container.tsx` | Escala tipográfica, `text-balance` em títulos, padding refinado |
| `src/components/ui/sidebar.tsx` | Ajustes mínimos de tokens (via CSS vars, não reescrever componente) |

### Modificar — Camada 3: Layout Shell
| Arquivo | Mudança |
|---------|---------|
| `src/app/(protected)/layout.tsx` | Fundo unificado, `SidebarInset` pattern se aplicável |
| `src/app/(protected)/_components/app-sidebar.tsx` | Nav integrada, logo compacto, active state refinado, copy PT-BR |
| `src/app/(protected)/_components/app-header.tsx` | Header borderless/subtle, remover badge fake, `aria-label` nos icon buttons |

### Modificar — Camada 4: Dashboard & Agendamentos
| Arquivo | Mudança |
|---------|---------|
| `src/app/(protected)/dashboard/page.tsx` | Composição com PageSection, remover Card wrapper da tabela |
| `src/app/(protected)/dashboard/_components/stats-cards.tsx` | Refatorar para grid de StatMetric sem cards |
| `src/app/(protected)/dashboard/_components/appointments-chart.tsx` | PageSection, cores do chart via CSS vars, grid sutil |
| `src/app/(protected)/dashboard/_components/top-doctors.tsx` | Lista limpa, tokens sem gray hardcoded |
| `src/app/(protected)/dashboard/_components/top-specialities.tsx` | Ícones monocromáticos muted, progress bar sutil |
| `src/app/(protected)/dashboard/_components/date-picker.tsx` | Copy PT-BR, estilo outline refinado |
| `src/app/(protected)/appointments/page.tsx` | Header copy, layout consistente |
| `src/app/(protected)/appointments/_components/appointments-table.tsx` | Empty state copy humanizado |
| `src/app/(protected)/appointments/_components/add-appointment-button.tsx` | CTA copy: "Nova consulta" |

### Revisão (web-design-guidelines)
Após implementação, auditar os arquivos acima contra Vercel Web Interface Guidelines — foco em: `aria-label` em icon buttons, `transition` explícito, `tabular-nums`, `focus-visible`, placeholders com `…`.

---

## Tarefas de Implementação

### Task 1: Design Tokens Globais

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Atualizar variáveis CSS**

Substituir blocos `:root` e `.dark` pela paleta Clinical Precision (valores na seção acima). Adicionar:

```css
@layer base {
  html {
    color-scheme: light dark;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

- [ ] **Step 2: Configurar Geist Sans**

```tsx
import { GeistSans } from "geist/font/sans";
// ou next/font: import { Geist } from "next/font/google"
```

Aplicar no `<body>` e atualizar `--font-sans` no `@theme inline`.

- [ ] **Step 3: Verificar visualmente**

Run: `npm run dev`
Expected: App carrega sem erros; cores mais quentes/neutras.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "refactor(ui): atualiza design tokens para paleta premium"
```

---

### Task 2: Primitivos UI (Button, Card, Input, Table)

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/table.tsx`
- Modify: `src/components/ui/data-table.tsx`
- Modify: `src/components/ui/page-container.tsx`

- [ ] **Step 1: Refinar button variants**

Trocar `transition-all` por propriedades explícitas. Adicionar `rounded-lg` no size default.

- [ ] **Step 2: Suavizar Card**

```tsx
"bg-card flex flex-col gap-6 rounded-xl border border-border py-6"
// remover shadow-sm ou trocar por shadow-none
```

- [ ] **Step 3: Refinar data-table**

Remover `rounded-md border` wrapper. Header: `bg-transparent`, labels `text-xs font-medium uppercase tracking-wider text-muted-foreground`.

- [ ] **Step 4: Atualizar page-container**

```tsx
export const PageTitle = ({ children }) => (
  <h1 className="text-2xl font-semibold tracking-tight text-balance">{children}</h1>
);
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/
git commit -m "refactor(ui): refina primitivos base para visual minimalista"
```

---

### Task 3: Componente PageSection + StatMetric

**Files:**
- Create: `src/components/ui/page-section.tsx`
- Create: `src/components/ui/stat-metric.tsx`

- [ ] **Step 1: Criar PageSection**

```tsx
interface PageSectionProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageSection({ title, description, action, children, className }: PageSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <h2 className="text-sm font-medium tracking-tight">{title}</h2>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Criar StatMetric**

Grid item sem card — label muted, value grande com `tabular-nums`.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/page-section.tsx src/components/ui/stat-metric.tsx
git commit -m "feat(ui): adiciona PageSection e StatMetric para hierarquia sem cards"
```

---

### Task 4: Layout Shell (Sidebar + Header)

**Files:**
- Modify: `src/app/(protected)/layout.tsx`
- Modify: `src/app/(protected)/_components/app-sidebar.tsx`
- Modify: `src/app/(protected)/_components/app-header.tsx`

- [ ] **Step 1: Sidebar integrada**

- Remover `border-b` do header da sidebar
- Logo menor (width ~140)
- Item ativo: indicador lateral 2px `bg-primary` + `bg-muted/80`
- Labels de grupo: `text-[11px] uppercase tracking-widest text-muted-foreground/70`
- Renomear "Menu Principal" → remover label ou usar "Navegação"

- [ ] **Step 2: Header minimalista**

- Border: `border-b border-border/60`
- Altura: `h-14` (mais compacto)
- Remover badge vermelho fixo do Bell
- Adicionar `aria-label="Notificações"` e `aria-label="Menu do usuário"`

- [ ] **Step 3: Layout wrapper**

```tsx
<main className="flex flex-1 flex-col bg-background">
```

- [ ] **Step 4: Commit**

```bash
git add src/app/(protected)/
git commit -m "refactor(ui): sidebar e header integrados ao fundo"
```

---

### Task 5: Dashboard

**Files:**
- Modify: `src/app/(protected)/dashboard/page.tsx`
- Modify: `src/app/(protected)/dashboard/_components/stats-cards.tsx`
- Modify: `src/app/(protected)/dashboard/_components/appointments-chart.tsx`
- Modify: `src/app/(protected)/dashboard/_components/top-doctors.tsx`
- Modify: `src/app/(protected)/dashboard/_components/top-specialities.tsx`
- Modify: `src/app/(protected)/dashboard/_components/date-picker.tsx`

- [ ] **Step 1: Refatorar stats-cards → StatMetric grid**

Layout: `grid grid-cols-2 lg:grid-cols-4 divide-x divide-border/60` sem cards individuais.

- [ ] **Step 2: Chart com PageSection**

Remover Card wrapper. Cores hardcoded `#0B68F7` → `var(--primary)` e `var(--chart-2)`.

- [ ] **Step 3: Top lists**

Substituir Card por PageSection. Avatar fallback usa `bg-muted text-muted-foreground`.

- [ ] **Step 4: Date picker copy**

"Pick a date" → "Selecionar período…"

- [ ] **Step 5: Dashboard page composition**

Remover Card wrapper da AppointmentsTable. Grid responsivo: `grid-cols-1 xl:grid-cols-[1fr_320px]`.

- [ ] **Step 6: Commit**

```bash
git add src/app/(protected)/dashboard/
git commit -m "refactor(ui): dashboard premium sem cardificação excessiva"
```

---

### Task 6: Agendamentos + Copy Pass

**Files:**
- Modify: `src/app/(protected)/appointments/page.tsx`
- Modify: `src/app/(protected)/appointments/_components/appointments-table.tsx`
- Modify: `src/app/(protected)/appointments/_components/add-appointment-button.tsx`

- [ ] **Step 1: Atualizar copy das páginas**

Aplicar tabela de micro-copy da seção acima.

- [ ] **Step 2: CTA "Nova consulta"**

Botão primário com label específica (guideline Vercel: labels específicas > genéricas).

- [ ] **Step 3: Commit**

```bash
git add src/app/(protected)/appointments/
git commit -m "refactor(ui): agendamentos com copy humana e layout consistente"
```

---

### Task 7: Auditoria Web Interface Guidelines

**Files:** Todos os arquivos modificados

- [ ] **Step 1: Rodar checklist Vercel**

Verificar: aria-labels, focus-visible, tabular-nums, transition explícito, placeholders com `…`, sem `transition-all`.

- [ ] **Step 2: Corrigir findings**

Documentar e corrigir inline.

- [ ] **Step 3: Commit final**

```bash
git commit -m "fix(a11y): corrige findings da auditoria web interface guidelines"
```

---

## Self-Review

**Spec coverage:**
- ✅ Tokens globais → Task 1
- ✅ Sidebar/Navbar → Task 4
- ✅ Dashboard/Agendamentos → Tasks 5–6
- ✅ Componentização DRY → Task 3 (PageSection, StatMetric)
- ✅ Copywriting → Task 6 + tabela dedicada
- ✅ Web Guidelines → Task 7
- ⏸ Landing page, auth, doctors/patients → Fase 2 (fora de escopo)

**Placeholder scan:** Nenhum TBD/TODO encontrado.

**Estimativa:** ~7 commits incrementais, ~2–3h de implementação.

---

## Decisões Pendentes de Aprovação

Antes de executar, confirme:

1. **Fonte:** Geist Sans (recomendado, estilo Vercel) ou manter Manrope?
2. **Primary color:** Manter azul médico refinado ou migrar para tom mais neutro (quase preto) com azul só em CTAs?
3. **Escopo:** Aprovar apenas área autenticada (dashboard + agendamentos + shell) ou incluir auth/landing na mesma fase?
4. **Stats layout:** Grid dividido sem cards (proposto) vs. cards ultra-minimalistas com borda fina?

---

**Plan complete and saved to `docs/superpowers/plans/2026-06-11-premium-ui-refactor.md`.**

**Two execution options:**

1. **Subagent-Driven (recommended)** — subagente por task, review entre tasks
2. **Inline Execution** — executar tasks nesta sessão com checkpoints

**Qual abordagem prefere? E as 4 decisões acima?**
