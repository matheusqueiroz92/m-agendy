# Busca de paciente no modal de agendamento — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar o Select de paciente no modal de agendamento por combobox com busca no servidor e fluxo embutido de cadastro de paciente no mesmo Dialog.

**Architecture:** Estender `PatientRepository` + `SearchPatientsUseCase` + action `searchPatients`; combobox shadcn (Command + Popover) com debounce; `UpsertAppointmentForm` com passo `appointment | patient`; `upsertPatient` passa a devolver `patientId` para auto-seleção.

**Tech Stack:** Next.js App Router, Drizzle, Vitest, next-safe-action, React Hook Form + Zod, ShadCN (`command`, `popover`), `cmdk`.

**Spec:** [docs/superpowers/specs/2026-07-21-appointment-patient-search-design.md](../specs/2026-07-21-appointment-patient-search-design.md)

---

## File map

| Área | Criar / modificar |
|------|-------------------|
| Porta + fake | `patient-repository.ts`, `in-memory-patient-repository.ts` |
| Use case | `search-patients.ts` + `search-patients.spec.ts` |
| Drizzle | `drizzle-patient-repository.ts` |
| Factory | `make-patient-use-cases.ts` |
| Action search | `src/actions/search-patients/schema.ts`, `index.ts` |
| Action upsert | `src/actions/upsert-patient/index.ts` (return `patientId`) |
| UI shadcn | `src/components/ui/command.tsx` (+ deps `cmdk`) |
| Combobox | `appointments/_components/patient-search-combobox.tsx` |
| Forms | `upsert-appointment-form.tsx`, `upsert-patient-form.tsx` |
| Call sites | Remover prop `patients` onde só servia o Select (`add-appointment-button`, tabs, table-actions, schedule-board, page) — manter `patients` só se ainda for usado por tabela/lista |

---

### Task 1: Porta + InMemory — `searchByClinic`

**Files:**
- Modify: `src/core/modules/patients/application/ports/patient-repository.ts`
- Modify: `src/core/modules/patients/application/testing/in-memory-patient-repository.ts`

- [ ] **Step 1: Estender a porta**

Em `patient-repository.ts`, adicionar:

```ts
export type PatientSearchResult = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
};

export type SearchPatientsByClinicInput = {
  clinicId: string;
  query: string;
  limit: number;
};

export interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
  save(patient: Patient): Promise<void>;
  delete(id: string): Promise<void>;
  searchByClinic(
    input: SearchPatientsByClinicInput,
  ): Promise<PatientSearchResult[]>;
}
```

- [ ] **Step 2: Implementar no InMemory**

Em `in-memory-patient-repository.ts`:

```ts
async searchByClinic(
  input: SearchPatientsByClinicInput,
): Promise<PatientSearchResult[]> {
  const normalized = input.query.trim().toLowerCase();
  const filtered = this.items
    .filter((patient) => patient.clinicId === input.clinicId)
    .filter((patient) => {
      if (!normalized) return true;
      const p = patient.toPrimitives();
      return (
        p.name.toLowerCase().includes(normalized) ||
        p.email.toLowerCase().includes(normalized) ||
        p.phoneNumber.includes(normalized)
      );
    })
    .sort((a, b) =>
      a.toPrimitives().name.localeCompare(b.toPrimitives().name, "pt-BR"),
    )
    .slice(0, input.limit);

  return filtered.map((patient) => {
    const p = patient.toPrimitives();
    return {
      id: p.id,
      name: p.name,
      email: p.email,
      phoneNumber: p.phoneNumber,
    };
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/core/modules/patients/application/ports/patient-repository.ts src/core/modules/patients/application/testing/in-memory-patient-repository.ts
git commit -m "feat(patients): add searchByClinic to patient repository port"
```

---

### Task 2: `SearchPatientsUseCase` (TDD)

**Files:**
- Create: `src/core/modules/patients/application/use-cases/search-patients.ts`
- Create: `src/core/modules/patients/application/use-cases/search-patients.spec.ts`
- Modify: `src/core/modules/patients/infra/factories/make-patient-use-cases.ts`

- [ ] **Step 1: Escrever o teste que falha**

Criar `search-patients.spec.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";

import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { ForbiddenError } from "@/core/shared/domain/errors";

import { Patient } from "../../domain/patient";
import { InMemoryPatientRepository } from "../testing/in-memory-patient-repository";
import { SearchPatientsUseCase } from "./search-patients";

describe("SearchPatientsUseCase", () => {
  let patients: InMemoryPatientRepository;
  let useCase: SearchPatientsUseCase;

  const manager = new AuthenticatedActor({
    userId: "u1",
    platformRole: "member",
    memberships: [{ clinicId: "clinic-1", role: "manager" }],
  });

  beforeEach(() => {
    patients = new InMemoryPatientRepository();
    useCase = new SearchPatientsUseCase(patients, new Authorizer());
  });

  const seed = async () => {
    await patients.save(
      Patient.create({
        clinicId: "clinic-1",
        name: "Ana Costa",
        email: "ana@example.com",
        phoneNumber: "11911111111",
        sex: "female",
      }),
    );
    await patients.save(
      Patient.create({
        clinicId: "clinic-1",
        name: "Bruno Lima",
        email: "bruno@example.com",
        phoneNumber: "11922222222",
        sex: "male",
      }),
    );
    await patients.save(
      Patient.create({
        clinicId: "clinic-2",
        name: "Ana Outra",
        email: "outra@example.com",
        phoneNumber: "11933333333",
        sex: "female",
      }),
    );
  };

  it("retorna lista limitada da clínica quando a query é vazia", async () => {
    await seed();
    const result = await useCase.execute({
      actor: manager,
      clinicId: "clinic-1",
      query: "",
      limit: 20,
    });
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.name)).toEqual(["Ana Costa", "Bruno Lima"]);
  });

  it("filtra por nome parcial case-insensitive", async () => {
    await seed();
    const result = await useCase.execute({
      actor: manager,
      clinicId: "clinic-1",
      query: "bru",
      limit: 20,
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Bruno Lima");
  });

  it("não retorna pacientes de outra clínica", async () => {
    await seed();
    const result = await useCase.execute({
      actor: manager,
      clinicId: "clinic-1",
      query: "Ana",
      limit: 20,
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Ana Costa");
  });

  it("nega quando o ator não pode gerenciar a clínica", async () => {
    const professional = new AuthenticatedActor({
      userId: "u2",
      platformRole: "member",
      memberships: [{ clinicId: "clinic-1", role: "professional" }],
    });
    await expect(
      useCase.execute({
        actor: professional,
        clinicId: "clinic-1",
        query: "",
        limit: 20,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

```bash
npm test -- src/core/modules/patients/application/use-cases/search-patients.spec.ts
```

Expected: FAIL (módulo/classe não existe).

- [ ] **Step 3: Implementar o use case**

Criar `search-patients.ts`:

```ts
import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";

import {
  PatientRepository,
  PatientSearchResult,
} from "../ports/patient-repository";

export interface SearchPatientsInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  query: string;
  limit: number;
}

export class SearchPatientsUseCase {
  constructor(
    private readonly patients: PatientRepository,
    private readonly authorizer: Authorizer,
  ) {}

  async execute(input: SearchPatientsInput): Promise<PatientSearchResult[]> {
    this.authorizer.assertCanManageClinic(input.actor, input.clinicId);

    return this.patients.searchByClinic({
      clinicId: input.clinicId,
      query: input.query,
      limit: input.limit,
    });
  }
}
```

- [ ] **Step 4: Registrar factory**

Em `make-patient-use-cases.ts`, adicionar:

```ts
import { SearchPatientsUseCase } from "../../application/use-cases/search-patients";

export const makeSearchPatients = () =>
  new SearchPatientsUseCase(new DrizzlePatientRepository(), new Authorizer());
```

- [ ] **Step 5: Rodar os testes e confirmar que passam**

```bash
npm test -- src/core/modules/patients/application/use-cases/search-patients.spec.ts
```

Expected: PASS (4 testes).

- [ ] **Step 6: Commit**

```bash
git add src/core/modules/patients/application/use-cases/search-patients.ts src/core/modules/patients/application/use-cases/search-patients.spec.ts src/core/modules/patients/infra/factories/make-patient-use-cases.ts
git commit -m "feat(patients): add SearchPatientsUseCase"
```

---

### Task 3: Drizzle `searchByClinic`

**Files:**
- Modify: `src/core/modules/patients/infra/persistence/drizzle-patient-repository.ts`

- [ ] **Step 1: Implementar busca com `ilike`**

```ts
import { and, asc, eq, ilike, or, sql } from "drizzle-orm";

import {
  PatientRepository,
  PatientSearchResult,
  SearchPatientsByClinicInput,
} from "../../application/ports/patient-repository";

// dentro da classe:
async searchByClinic(
  input: SearchPatientsByClinicInput,
): Promise<PatientSearchResult[]> {
  const normalized = input.query.trim();
  const filters = [eq(patientsTable.clinicId, input.clinicId)];

  if (normalized) {
    const pattern = `%${normalized}%`;
    filters.push(
      or(
        ilike(patientsTable.name, pattern),
        ilike(patientsTable.email, pattern),
        ilike(patientsTable.phoneNumber, pattern),
      )!,
    );
  }

  const rows = await db
    .select({
      id: patientsTable.id,
      name: patientsTable.name,
      email: patientsTable.email,
      phoneNumber: patientsTable.phoneNumber,
    })
    .from(patientsTable)
    .where(and(...filters))
    .orderBy(asc(patientsTable.name))
    .limit(input.limit);

  return rows;
}
```

Remover import `sql` se não for usado.

- [ ] **Step 2: Commit**

```bash
git add src/core/modules/patients/infra/persistence/drizzle-patient-repository.ts
git commit -m "feat(patients): implement searchByClinic in Drizzle repository"
```

---

### Task 4: Action `searchPatients` + retorno de `patientId` no upsert

**Files:**
- Create: `src/actions/search-patients/schema.ts`
- Create: `src/actions/search-patients/index.ts`
- Modify: `src/actions/upsert-patient/index.ts`

- [ ] **Step 1: Schema e action de busca**

`schema.ts`:

```ts
import { z } from "zod";

export const searchPatientsSchema = z.object({
  query: z.string().trim().max(100).optional().default(""),
  limit: z.number().int().min(1).max(50).optional().default(20),
});
```

`index.ts`:

```ts
"use server";

import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeSearchPatients } from "@/core/modules/patients/infra/factories/make-patient-use-cases";
import { UnauthorizedError } from "@/core/shared/domain/errors";
import { actionClient } from "@/lib/next-safe-action";

import { searchPatientsSchema } from "./schema";

export const searchPatients = actionClient
  .schema(searchPatientsSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) {
      throw new UnauthorizedError();
    }

    const clinicId = resolveCurrentClinicId(actor);

    const patients = await makeSearchPatients().execute({
      actor,
      clinicId,
      query: parsedInput.query,
      limit: parsedInput.limit,
    });

    return { patients };
  });
```

- [ ] **Step 2: Propagar `patientId` no upsert**

Em `src/actions/upsert-patient/index.ts`, trocar o `await makeUpsertPatient().execute(...)` para:

```ts
const result = await makeUpsertPatient().execute({
  actor,
  clinicId,
  ...parsedInput,
});

revalidatePath("/patients");
revalidatePath("/appointments");

return { patientId: result.patientId };
```

- [ ] **Step 3: Commit**

```bash
git add src/actions/search-patients src/actions/upsert-patient/index.ts
git commit -m "feat(patients): add searchPatients action and return patientId on upsert"
```

---

### Task 5: Componente shadcn `command`

**Files:**
- Create: `src/components/ui/command.tsx`
- Modify: `package.json` / `package-lock.json` (via CLI)

- [ ] **Step 1: Instalar Command**

```bash
npx shadcn@latest add command --yes
```

Expected: cria `src/components/ui/command.tsx` e adiciona `cmdk` ao `package.json`. `popover` já existe — não duplicar.

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/command.tsx package.json package-lock.json
git commit -m "chore(ui): add shadcn command component"
```

---

### Task 6: `UpsertPatientForm` — `patientId` no success + modo `embedded`

**Files:**
- Modify: `src/app/(protected)/patients/_components/upsert-patient-form.tsx`

- [ ] **Step 1: Ajustar props e callback**

Trocar a interface e o uso da action:

```ts
interface UpsertPatientFormProps {
  patient?: typeof patientsTable.$inferSelect;
  onSuccess?: (result: { patientId: string; name: string }) => void;
  onCancel?: () => void;
  /** Quando true, não envolve DialogContent (uso dentro de outro Dialog). */
  embedded?: boolean;
}

export const UpsertPatientForm = ({
  patient,
  onSuccess,
  onCancel,
  embedded = false,
}: UpsertPatientFormProps) => {
  // ... form igual

  const upsertPatientAction = useAction(upsertPatient, {
    onSuccess: ({ data }) => {
      toast.success(
        patient
          ? "Paciente atualizado com sucesso."
          : "Paciente adicionado com sucesso.",
      );
      if (data?.patientId) {
        onSuccess?.({
          patientId: data.patientId,
          name: form.getValues("name"),
        });
      }
    },
    onError: (error) => {
      console.log(error);
      toast.error("Erro ao salvar paciente.");
    },
  });
```

- [ ] **Step 2: Extrair o corpo e wrap condicional**

O conteúdo interno (header + form) deve ser o mesmo. Footer:

```tsx
<DialogFooter className={embedded ? "flex-col gap-2 sm:flex-col" : undefined}>
  {embedded && onCancel && (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={onCancel}
      disabled={upsertPatientAction.isPending}
    >
      Voltar
    </Button>
  )}
  <Button
    type="submit"
    disabled={upsertPatientAction.isPending}
    className="w-full"
  >
    {upsertPatientAction.isPending ? "Salvando..." : "Salvar"}
  </Button>
</DialogFooter>
```

Retorno:

```tsx
const body = (
  <>
    <DialogHeader>
      <DialogTitle>
        {patient ? patient.name : "Adicionar paciente"}
      </DialogTitle>
      <DialogDescription>
        {patient
          ? "Edite as informações desse paciente."
          : "Adicione um novo paciente."}
      </DialogDescription>
    </DialogHeader>
    <Form {...form}>
      {/* fields existentes + footer acima */}
    </Form>
  </>
);

if (embedded) {
  return <div className="space-y-4">{body}</div>;
}

return (
  <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
    {body}
  </DialogContent>
);
```

`AddPatientButton` continua sem mudanças de API (`onSuccess` opcional sem argumentos ainda funciona se tipado como `(patientId?: string) => void`, ou o call site `() => setIsOpen(false)` aceita ignorar o argumento).

- [ ] **Step 3: Commit**

```bash
git add src/app/(protected)/patients/_components/upsert-patient-form.tsx
git commit -m "feat(patients): support embedded UpsertPatientForm and patientId callback"
```

---

### Task 7: `PatientSearchCombobox`

**Files:**
- Create: `src/app/(protected)/appointments/_components/patient-search-combobox.tsx`

- [ ] **Step 1: Criar o combobox**

```tsx
"use client";

import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";

import { searchPatients } from "@/actions/search-patients";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type PatientSearchOption = {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
};

interface PatientSearchComboboxProps {
  value: string;
  selectedLabel?: string;
  onSelect: (patient: PatientSearchOption) => void;
  onCreatePatient: () => void;
  disabled?: boolean;
}

export function PatientSearchCombobox({
  value,
  selectedLabel,
  onSelect,
  onCreatePatient,
  disabled,
}: PatientSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<PatientSearchOption[]>([]);

  const searchAction = useAction(searchPatients, {
    onSuccess: ({ data }) => {
      setOptions(data?.patients ?? []);
    },
    onError: () => {
      setOptions([]);
    },
  });

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      searchAction.execute({ query, limit: 20 });
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- execute identity muda; debounce por query/open
  }, [query, open]);

  const showCreate =
    !searchAction.isExecuting &&
    (options.length === 0 || (query.trim().length > 0 && options.length === 0));

  // Empty clinic (query "") with 0 results also shows create — same condition:
  const emptyState = !searchAction.isExecuting && options.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selectedLabel || "Buscar paciente…"}
          </span>
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Digite o nome do paciente…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {searchAction.isExecuting && (
              <div className="text-muted-foreground p-2 text-center text-sm">
                Buscando…
              </div>
            )}
            {emptyState && (
              <CommandEmpty className="p-2">
                <p className="text-muted-foreground mb-2 text-sm">
                  {query.trim()
                    ? "Nenhum paciente encontrado."
                    : "Nenhum paciente cadastrado."}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setOpen(false);
                    onCreatePatient();
                  }}
                >
                  <PlusIcon className="mr-2 size-4" />
                  Cadastrar paciente
                </Button>
              </CommandEmpty>
            )}
            <CommandGroup>
              {options.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.id}
                  onSelect={() => {
                    onSelect(patient);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 size-4",
                      value === patient.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{patient.name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      {patient.phoneNumber}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {!emptyState && (
              <div className="border-t p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    setOpen(false);
                    onCreatePatient();
                  }}
                >
                  <PlusIcon className="mr-2 size-4" />
                  Cadastrar paciente
                </Button>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

Nota: a spec pede o botão principalmente no empty state. O botão extra no rodapé quando há resultados é opcional YAGNI — **remover o bloco `!emptyState` do rodapé** na implementação final para ficar alinhado à spec (só empty state). Manter apenas o botão dentro de `CommandEmpty`.

- [ ] **Step 2: Commit**

```bash
git add src/app/(protected)/appointments/_components/patient-search-combobox.tsx
git commit -m "feat(appointments): add PatientSearchCombobox"
```

---

### Task 8: Integrar no `UpsertAppointmentForm`

**Files:**
- Modify: `src/app/(protected)/appointments/_components/upsert-appointment-form.tsx`
- Modify call sites que passam `patients` só para o form:  
  `add-appointment-button.tsx`, `table-actions.tsx`, `schedule-board.tsx`, e tipos em `appointments-view-tabs.tsx` / `page.tsx` se o form deixar de exigir `patients`

- [ ] **Step 1: Estado de passo + label do paciente**

No topo do form:

```ts
import { UpsertPatientForm } from "@/app/(protected)/patients/_components/upsert-patient-form";
import { PatientSearchCombobox } from "./patient-search-combobox";

type Step = "appointment" | "patient";

// props: remover `patients` obrigatório
interface UpsertAppointmentFormProps {
  doctors: DoctorOption[];
  appointment?: /* igual */;
  defaultValues?: /* igual */;
  onSuccess?: () => void;
}

const [step, setStep] = useState<Step>("appointment");
const [selectedPatientLabel, setSelectedPatientLabel] = useState(
  appointment?.patient?.name ?? "",
);
```

Quando o dialog pai fecha, o componente desmonta (padrão atual com `open &&` em alguns lugares) — se o form permanecer montado, adicionar reset:

```ts
// se necessário no pai: key={isOpen ? "open" : "closed"}
```

- [ ] **Step 2: Trocar o campo paciente pelo combobox**

Substituir o `Select` de paciente por:

```tsx
<FormField
  control={form.control}
  name="patientId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Paciente</FormLabel>
      <FormControl>
        <PatientSearchCombobox
          value={field.value}
          selectedLabel={selectedPatientLabel}
          onSelect={(patient) => {
            handlePatientChange(patient.id);
            setSelectedPatientLabel(patient.name);
          }}
          onCreatePatient={() => setStep("patient")}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

- [ ] **Step 3: Render condicional do passo**

No `return`, se `step === "patient"`:

```tsx
return (
  <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
    <UpsertPatientForm
      embedded
      onCancel={() => setStep("appointment")}
      onSuccess={({ patientId, name }) => {
        handlePatientChange(patientId);
        setSelectedPatientLabel(name);
        setStep("appointment");
      }}
    />
  </DialogContent>
);
```

`AddPatientButton` continua com `onSuccess={() => setIsOpen(false)}` (ignora o argumento).

- [ ] **Step 4: Remover prop `patients` dos call sites do form**

Atualizar:

- `add-appointment-button.tsx` — remover prop `patients` da interface e do form
- `table-actions.tsx` — não passar `patients` ao `UpsertAppointmentForm`
- `schedule-board.tsx` — idem nos `UpsertAppointmentForm`
- Manter `patients` na página/tabs se a **tabela/lista** ainda precisar

- [ ] **Step 5: Smoke manual**

1. Abrir Novo agendamento → abrir combobox → lista inicial.
2. Digitar nome inexistente → empty + Cadastrar paciente.
3. Cadastrar → volta ao agendamento com paciente selecionado → concluir agendamento.
4. Editar agendamento → nome do paciente aparece no trigger.

- [ ] **Step 6: Commit**

```bash
git add src/app/(protected)/appointments/_components/upsert-appointment-form.tsx src/app/(protected)/appointments/_components/add-appointment-button.tsx src/app/(protected)/appointments/_components/table-actions.tsx src/app/(protected)/appointments/_components/schedule-board/schedule-board.tsx src/app/(protected)/patients/_components/upsert-patient-form.tsx
git commit -m "feat(appointments): wire patient search combobox and inline create flow"
```

---

### Task 9: Verificação final

- [ ] **Step 1: Testes unitários**

```bash
npm test -- src/core/modules/patients
```

Expected: PASS (inclui search + upsert existentes).

- [ ] **Step 2: Lint dos arquivos tocados**

```bash
npx eslint src/app/(protected)/appointments/_components/patient-search-combobox.tsx src/app/(protected)/appointments/_components/upsert-appointment-form.tsx src/actions/search-patients src/core/modules/patients/application/use-cases/search-patients.ts
```

Expected: sem erros novos.

- [ ] **Step 3: Commit de correções** (somente se houver fix)

```bash
git add -A
git commit -m "fix(appointments): polish patient search after verification"
```

(Skip se working tree limpa.)

---

## Spec coverage checklist

| Requisito da spec | Task |
|-------------------|------|
| Combobox digitável + Command/Popover | 5, 7 |
| Busca servidor + debounce 300ms | 2–4, 7 |
| Empty state + Cadastrar paciente | 7 |
| Troca de conteúdo no mesmo Dialog | 6, 8 |
| Formulário paciente em branco | 8 (sem defaultValues de nome) |
| Após salvar, selecionar paciente | 4, 6, 8 |
| Novo e editar agendamento | 8 |
| Lista inicial limit 20 | 2, 4, 7 |
| `assertCanManageClinic` | 2 |
| `upsertPatient` retorna `patientId` | 4 |
| Testes unitários search | 2 |
| Sem e2e obrigatório | — |

## Self-review notes

- `onSuccess({ patientId, name })` definido na Task 6 e consumido na Task 8.
- Não aninhar dois `DialogContent`: modo `embedded` obrigatório.
- Combobox: botão “Cadastrar paciente” **somente** no empty state (sem rodapé extra).
