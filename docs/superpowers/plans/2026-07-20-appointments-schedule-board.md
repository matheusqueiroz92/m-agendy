# Quadro de Agendamentos (Drag-and-Drop) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o quadro semanal/diário de agendamentos com drag-and-drop, resize de duração, disponibilidade por janelas multi-intervalo e abas Quadro/Lista.

**Architecture:** Migração de schema (duração + `doctor_availability_windows`) → domínio de availability/overlap → use-cases/actions → UI do cadastro de profissional → ScheduleBoard com `@dnd-kit` na página `/appointments`.

**Tech Stack:** Next.js App Router, Drizzle, Vitest, next-safe-action, React Hook Form + Zod, ShadCN, Dayjs, `@dnd-kit/core` + `@dnd-kit/utilities`.

**Spec:** [docs/superpowers/specs/2026-07-20-appointments-schedule-board-design.md](../specs/2026-07-20-appointments-schedule-board-design.md)

---

## File map

| Área | Criar / modificar |
|------|-------------------|
| Schema | `src/db/schema.ts` + migração gerada |
| Availability domain | `src/core/modules/scheduling/domain/availability.ts` (+ `.spec.ts`) |
| Appointment domain | `src/core/modules/scheduling/domain/appointment.ts` |
| Appointment repo/port | ports + drizzle + fakes |
| Professional domain/repo | `professional.ts`, drizzle repo, upsert use-case |
| Actions | `upsert-appointment`, `upsert-doctor`, nova `reschedule-appointment`, `get-available-time-slots` |
| Doctors UI | `upsert-doctor-form.tsx`, schema |
| Appointments UI | `page.tsx`, `_components/appointments-view-tabs.tsx`, `schedule-board/*`, `appointment-details-dialog.tsx` |
| Data | `get-data-table-appointments.ts` (incluir `availabilityWindows`) |
| Deps | `package.json` (`@dnd-kit/*`) |

---

### Task 1: Schema — duração e janelas de disponibilidade

**Files:**
- Modify: `src/db/schema.ts`
- Create: migração via `npm run drizzle:generate`

- [ ] **Step 1: Atualizar schema**

Em `doctorsTable`, adicionar:

```ts
defaultAppointmentDurationInMinutes: integer(
  "default_appointment_duration_in_minutes",
)
  .notNull()
  .default(30),
```

Manter temporariamente as 4 colunas antigas até a Task 2 (migração de dados + drop).

Nova tabela:

```ts
export const doctorAvailabilityWindowsTable = pgTable(
  "doctor_availability_windows",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => doctorsTable.id, { onDelete: "cascade" }),
    weekDay: integer("week_day").notNull(), // 0–6
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
);
```

Em `appointmentsTable`:

```ts
durationInMinutes: integer("duration_in_minutes").notNull().default(30),
```

Atualizar relations: `doctors` → `many(doctorAvailabilityWindowsTable)`; windows → `one(doctorsTable)`.

- [ ] **Step 2: Gerar e aplicar migração**

```bash
npm run drizzle:generate
npm run drizzle:migrate
```

Expected: migration cria colunas com default 30 e a nova tabela.

- [ ] **Step 3: Commit**

```bash
git add src/db/schema.ts drizzle/
git commit -m "feat(db): add appointment duration and availability windows"
```

---

### Task 2: Migração de dados — expandir disponibilidade antiga e dropar colunas

**Files:**
- Create: SQL custom na pasta de migrations (ou script one-shot documentado no mesmo PR)
- Modify: `src/db/schema.ts` (remover 4 colunas antigas após backfill)

- [ ] **Step 1: Backfill SQL**

Para cada doctor, inserir uma row em `doctor_availability_windows` por cada `week_day` no range `[available_from_week_day, available_to_week_day]` (suportar wrap sexta→segunda como em `isDayAvailable`), com `start_time`/`end_time` iguais aos campos antigos.

Pseudológica (Node/TS one-shot aceitável se preferir):

```ts
for (const doctor of doctors) {
  for (let d = 0; d <= 6; d++) {
    if (!isDayAvailable(d, doctor.availableFromWeekDay, doctor.availableToWeekDay)) continue;
    await insertWindow({
      doctorId: doctor.id,
      weekDay: d,
      startTime: doctor.availableFromTime,
      endTime: doctor.availableToTime,
    });
  }
}
```

- [ ] **Step 2: Dropar colunas antigas no schema + nova migration**

Remover de `doctorsTable`: `availableFromWeekDay`, `availableToWeekDay`, `availableFromTime`, `availableToTime`.

```bash
npm run drizzle:generate
npm run drizzle:migrate
```

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(db): migrate doctor availability to per-day windows"
```

---

### Task 3: Domínio — availability 15 min + overlap

**Files:**
- Modify: `src/core/modules/scheduling/domain/availability.ts`
- Modify: `src/core/modules/scheduling/domain/availability.spec.ts`
- Create helpers de overlap no mesmo arquivo (ou `interval.ts` irmão)

- [ ] **Step 1: Reescrever tipos e funções**

```ts
export interface AvailabilityWindow {
  weekDay: number; // 0–6
  startTime: string; // "HH:MM" | "HH:MM:SS"
  endTime: string;
}

export type ProfessionalAvailability = AvailabilityWindow[];

export const generateTimeSlots = (
  from: string,
  to: string,
  stepMinutes = 15,
): string[] => { /* ... */ };

export const intervalsOverlap = (
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean => aStart < bEnd && bStart < aEnd;

export const isWithinAvailability = (
  start: Date,
  durationMinutes: number,
  windows: AvailabilityWindow[],
): boolean => { /* start–end contido em alguma janela do weekDay */ };

export const computeAvailableSlots = (
  date: string,
  windows: AvailabilityWindow[],
  occupiedIntervals: { start: Date; end: Date }[],
  slotDurationMinutes: number,
): TimeSlot[] => { /* slots 15min cujo [start,start+duration) cabe na janela e não overlap */ };
```

Manter `dayOfWeekFromISODate`. Remover ou adaptar `isDayAvailable` para uso só na migração se ainda necessário.

- [ ] **Step 2: Testes Vitest**

Cobrir: slots 15 min; multi-janela no mesmo dia; dia sem janela → `[]`; overlap true/false; `isWithinAvailability` com almoço.

```bash
npx vitest run src/core/modules/scheduling/domain/availability.spec.ts
```

Expected: PASS

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(scheduling): 15-min slots and multi-window availability"
```

---

### Task 4: Domínio Appointment + conflito por intervalo

**Files:**
- Modify: `src/core/modules/scheduling/domain/appointment.ts`
- Modify: `src/core/modules/scheduling/application/ports/appointment-repository.ts`
- Modify: `src/core/modules/scheduling/infra/persistence/drizzle-appointment-repository.ts`
- Modify: fakes/in-memory + specs de upsert que usam conflito

- [ ] **Step 1: Adicionar `durationInMinutes` em `AppointmentProps`**

Validar no `create`: múltiplo de 15, >= 15. Incluir em `toPrimitives` / `restore` / `save`.

- [ ] **Step 2: Atualizar `ConflictQuery`**

```ts
export interface ConflictQuery {
  clinicId: string;
  doctorId: string;
  scheduledAt: Date;
  durationInMinutes: number;
  excludeAppointmentId?: string;
}
```

- [ ] **Step 3: `hasConflict` por overlap**

Carregar agendamentos do doctor no dia (ou janela ampla) com status ≠ `cancelled`, calcular fim = start + duration, usar `intervalsOverlap`. Excluir `no_show` do quadro na UI, mas no conflito de horário ainda considerar `pending`/`confirmed` (e opcionalmente `no_show` como liberado — **liberar no_show e cancelled**).

Implementação SQL aproximada (filtrar no app se volume baixo da clínica):

```ts
const candidates = await db.query.appointmentsTable.findMany({
  where: and(
    eq(clinicId),
    eq(doctorId),
    // date no mesmo dia civil do scheduledAt
    ne(status, "cancelled"),
    ne(status, "no_show"),
    excludeId ? ne(id, excludeId) : undefined,
  ),
});
return candidates.some((row) =>
  intervalsOverlap(
    query.scheduledAt,
    addMinutes(query.scheduledAt, query.durationInMinutes),
    row.date,
    addMinutes(row.date, row.durationInMinutes),
  ),
);
```

- [ ] **Step 4: Atualizar use-case `upsert-appointment` e testes**

Passar `durationInMinutes`; validar `isWithinAvailability` com janelas do profissional (ler via availability reader atualizado).

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(scheduling): duration and interval conflict detection"
```

---

### Task 5: Professional — janelas + duração padrão

**Files:**
- Modify: `src/core/modules/professionals/domain/professional.ts`
- Modify: ports/repo drizzle + in-memory
- Modify: `upsert-professional.ts` (+ spec)
- Modify: `src/actions/upsert-doctor/schema.ts` + action
- Modify: `src/app/(protected)/doctors/_components/upsert-doctor-form.tsx`
- Modify: availability reader drizzle

- [ ] **Step 1: Modelo de domínio**

Substituir 4 campos de range por:

```ts
availabilityWindows: AvailabilityWindow[];
defaultAppointmentDurationInMinutes: number;
```

Validar: ao menos uma janela; sem overlap no mesmo `weekDay`; duração default múltiplo de 15.

- [ ] **Step 2: Persistência**

`save`: upsert doctor + delete windows do doctor + insert das novas (transação).

`find`: join/with `availabilityWindows`.

- [ ] **Step 3: Schema Zod da action**

```ts
availabilityWindows: z
  .array(
    z.object({
      weekDay: z.number().int().min(0).max(6),
      startTime: z.string().min(1),
      endTime: z.string().min(1),
    }),
  )
  .min(1),
defaultAppointmentDurationInMinutes: z
  .number()
  .int()
  .min(15)
  .refine((n) => n % 15 === 0),
```

Copy: “Nome do profissional…” (não “médico”).

- [ ] **Step 4: UI do form**

Lista Dom–Sáb: Switch “Atende”; se ligado, FieldArray de intervalos (início/fim) + botão adicionar/remover. Campo Select/Number para duração padrão (15/30/45/60…).

- [ ] **Step 5: Testes do use-case + commit**

```bash
npx vitest run src/core/modules/professionals
git commit -m "feat(professionals): multi-window availability and default duration"
```

---

### Task 6: Action `rescheduleAppointment` + slots públicos/autenticados

**Files:**
- Create: `src/actions/reschedule-appointment/index.ts`
- Create: `src/core/modules/scheduling/application/use-cases/reschedule-appointment.ts` (+ spec)
- Modify: `src/actions/upsert-appointment/index.ts` (campo duration)
- Modify: `get-available-time-slots` (+ public) e factories
- Modify: `src/app/(protected)/appointments/_components/upsert-appointment-form.tsx`

- [ ] **Step 1: Use case reschedule**

Input: `actor`, `clinicId`, `appointmentId`, `scheduledAt`, `durationInMinutes`.  
Regras: ownership/tenant; status pending/confirmed; `isWithinAvailability`; `hasConflict`; `save` com nova data/duração; auditoria se o upsert já audita (espelhar).

- [ ] **Step 2: Action shell**

```ts
const schema = z.object({
  id: z.string().uuid(),
  date: z.date(),
  time: z.string().min(1),
  durationInMinutes: z.number().int().min(15).refine((n) => n % 15 === 0),
});
```

`revalidatePath("/appointments")` e `/dashboard`.

- [ ] **Step 3: Form upsert**

Campo duração; default = `doctor.defaultAppointmentDurationInMinutes` ao trocar profissional. Label “Profissional”.

- [ ] **Step 4: Testes + commit**

```bash
npx vitest run src/core/modules/scheduling
git commit -m "feat(scheduling): reschedule action and duration on upsert"
```

---

### Task 7: Dependência `@dnd-kit` + shell da página com abas

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `src/app/(protected)/appointments/page.tsx`
- Create: `src/app/(protected)/appointments/_components/appointments-view-tabs.tsx`
- Modify: `src/data/get-data-table-appointments.ts` — `with: { availabilityWindows: true }` nos doctors

- [ ] **Step 1: Instalar**

```bash
npm install @dnd-kit/core @dnd-kit/utilities
```

- [ ] **Step 2: Client wrapper de abas**

```tsx
// appointments-view-tabs.tsx
"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Quadro | Lista — default "board"
```

`page.tsx` passa `doctors`, `patients`, `appointments` para o client; Lista renderiza `AppointmentsTable` existente; Quadro renderiza placeholder `ScheduleBoard` (próxima task).

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(appointments): board/list tabs shell and dnd-kit"
```

---

### Task 8: ScheduleBoard — grade, navegação, bloqueio por disponibilidade

**Files:**
- Create: `src/app/(protected)/appointments/_components/schedule-board/schedule-board.tsx`
- Create: `.../schedule-board-toolbar.tsx`
- Create: `.../schedule-grid.tsx`
- Create: `.../schedule-constants.ts` (`DAY_START=7`, `DAY_END=19`, `SLOT_MINUTES=15`, `SLOT_HEIGHT_PX=20`)
- Create: `.../use-schedule-navigation.ts`

- [ ] **Step 1: Constantes e helpers de layout**

```ts
export const SLOT_MINUTES = 15;
export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 19;
export const SLOT_HEIGHT_PX = 20;

export function minutesFromDayStart(hours: number, minutes: number) {
  return (hours - DAY_START_HOUR) * 60 + minutes;
}

export function topForDate(date: Date) {
  return (minutesFromDayStart(date.getHours(), date.getMinutes()) / SLOT_MINUTES) * SLOT_HEIGHT_PX;
}

export function heightForDuration(durationInMinutes: number) {
  return (durationInMinutes / SLOT_MINUTES) * SLOT_HEIGHT_PX;
}
```

- [ ] **Step 2: Toolbar**

Select Profissional; prev / Hoje / next; label do período; toggle Dia|Semana (`hidden` em mobile via `useIsMobile` — força `day`).

- [ ] **Step 3: Grid**

Colunas = dias visíveis; linhas = slots 07–19; células bloqueadas se fora de `availabilityWindows` do profissional selecionado (hatch/`bg-muted`); clique em célula livre abre modal novo com defaults.

- [ ] **Step 4: Renderizar blocos estáticos (sem DnD ainda)**

Filtrar appointments: `doctorId === selected`, status in `pending|confirmed`, data no range. Posicionar absolute por `top`/`height`.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(appointments): schedule grid with availability blocking"
```

---

### Task 9: Drag, resize, optimistic update

**Files:**
- Create: `.../appointment-block.tsx`
- Create: `.../use-reschedule-appointment.ts` (wrapper `useAction`)
- Modify: `schedule-board.tsx` / `schedule-grid.tsx`

- [ ] **Step 1: Drag com `@dnd-kit`**

`DndContext` + sensor Pointer; ao soltar, calcular dia + horário snapped (15 min); se slot inválido/bloqueado/overlap local → cancelar; senão optimistic + `rescheduleAppointment`.

- [ ] **Step 2: Resize handle**

`pointerdown` na borda inferior; arrastar altera duração snapped; soltar chama mesma action. Distinguir click vs drag (threshold ~5px) para abrir detalhes.

- [ ] **Step 3: Feedback**

Toast de erro + rollback; cursor `grabbing`; ghost opcional.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(appointments): drag-and-drop and resize on schedule board"
```

---

### Task 10: Modais de detalhes e novo a partir da grade

**Files:**
- Create: `.../appointment-details-dialog.tsx`
- Modify: `add-appointment-button.tsx` / form para aceitar `defaultValues` (doctorId, date, time, duration)
- Modify: `schedule-board.tsx` wiring

- [ ] **Step 1: Details dialog**

Read-only + botões Editar (abre `UpsertAppointmentForm` em Dialog) e Cancelar (`cancelAppointment` + AlertDialog como em `table-actions.tsx`).

- [ ] **Step 2: Empty cell → novo**

Estado controlado `createDefaults`; reutilizar form existente.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat(appointments): details and create modals from schedule board"
```

---

### Task 11: Polish, copy “Profissional”, regressão

**Files:**
- Forms/tabelas de appointments/doctors tocados nesta feature
- Specs/helpers legados (`src/helpers/availability.ts`) — atualizar ou deprecar apontando para domínio
- E2E seed se quebrar por colunas removidas (`e2e/global-setup.ts`)

- [ ] **Step 1: Substituir copy “médico” → “profissional”** nos textos da feature

- [ ] **Step 2: Rodar testes**

```bash
npm test
```

Corrigir quebras de seed/factories/e2e setup.

- [ ] **Step 3: Smoke manual**

Checklist: semana/dia, mobile dia, drag, resize, slot bloqueado, criar, detalhes, lista intacta.

- [ ] **Step 4: Commit final**

```bash
git commit -m "fix(appointments): professional copy and schedule board polish"
```

---

## Self-review (plan vs spec)

| Requisito do spec | Task |
|-------------------|------|
| duration + default no profissional | 1, 4, 5 |
| doctor_availability_windows multi-intervalo | 1, 2, 5 |
| slots 15 min + overlap | 3, 4 |
| abas Quadro/Lista | 7 |
| select profissional, dia/semana, mobile | 8 |
| drag + resize | 9 |
| modais novo/detalhes | 10 |
| slots bloqueados fora da disponibilidade | 8, 9 |
| copy Profissional (UI only) | 5, 10, 11 |
| rescheduleAppointment | 6 |

Sem placeholders TBD. Abordagem fixa: grid custom + `@dnd-kit`.
