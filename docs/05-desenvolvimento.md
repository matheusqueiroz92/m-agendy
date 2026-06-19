# Guia de desenvolvimento

## Convenções

- **TypeScript** em todo o código.
- **kebab-case** para arquivos e pastas.
- Nomes descritivos (`isLoading`, `hasError`).
- **DRY**: extraia funções/componentes reutilizáveis.
- Estilização só com **Tailwind**; componentes com **ShadCN/ui**.
- Formulários com **React Hook Form + Zod** (use `components/ui/form.tsx`).
- Server Actions com **next-safe-action** (`actionClient`) — sempre cascas finas.
- Datas com **Day.js**; máscaras de input com **react-number-format**.
- Animações com **Framer Motion**.
- Componente usado só numa página → pasta `_components` daquela página.

## Como adicionar uma nova funcionalidade (fatia hexagonal)

Siga sempre a ordem **domínio → aplicação → infra → entrega**, escrevendo testes
junto com o domínio/aplicação. Exemplo: "anexos do prontuário".

### 1. Domínio (`core/modules/<contexto>/domain/`)
Entidade/VO puro, com invariантes. Sem framework.

```ts
// attachment.ts
export class Attachment {
  private constructor(private props: AttachmentProps) {}
  static create(props: CreateAttachmentProps): Attachment { /* valida */ }
  toPrimitives() { /* ... */ }
}
```

### 2. Portas + caso de uso (`application/`)
Defina **só o que o caso de uso precisa** como interface (porta) e orquestre.

```ts
// application/ports/attachment-repository.ts
export interface AttachmentRepository {
  save(a: Attachment): Promise<void>;
  listByPatient(patientId: string, clinicId: string): Promise<Attachment[]>;
}

// application/use-cases/upsert-attachment.ts
export class UpsertAttachmentUseCase {
  constructor(
    private readonly repo: AttachmentRepository,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}
  async execute(input: UpsertAttachmentInput) {
    this.authorizer.assertCanAccessClinicalData(input.actor, input.clinicId);
    // ...regra, repo.save, audit.record
  }
}
```

### 3. Testes (`application/testing/` + `*.spec.ts`)
Crie um fake da porta e teste o caso de uso sem banco.

```ts
export class InMemoryAttachmentRepository implements AttachmentRepository { /* ... */ }
```
```ts
// upsert-attachment.spec.ts — usa o fake; valida regra e auditoria
```

### 4. Infra (`infra/`)
Adapter concreto da porta + factory (composition root).

```ts
// infra/persistence/drizzle-attachment-repository.ts
export class DrizzleAttachmentRepository implements AttachmentRepository { /* db */ }

// infra/factories/make-attachment-use-cases.ts
export const makeUpsertAttachment = () =>
  new UpsertAttachmentUseCase(
    new DrizzleAttachmentRepository(),
    new Authorizer(),
    new DrizzleAuditLog(),
  );
```

### 5. Entrega (`src/actions/` e/ou página)
Casca fina: schema Zod + resolve ator + chama a factory.

```ts
"use server";
export const upsertAttachment = actionClient
  .schema(upsertAttachmentSchema)
  .action(async ({ parsedInput }) => {
    const actor = await getAuthenticatedActor();
    if (!actor) throw new UnauthorizedError();
    const clinicId = resolveCurrentClinicId(actor);
    await makeUpsertAttachment().execute({ actor, clinicId, ...parsedInput });
    revalidatePath(`/medical-records/${parsedInput.patientId}`);
  });
```

### 6. Schema + migração
Adicione a tabela em `src/db/schema.ts`. Em dev: `npx drizzle-kit push`. Para
produção, gere um SQL idempotente em `drizzle/manual/apply-<feature>.sql`.

### 7. UI
Componentes em `_components/` da página, com RHF + Zod + ShadCN, chamando a
action via `useAction`.

## Erros e mensagens

Lance subclasses de **`DomainError`** no domínio/aplicação. Só elas têm a
mensagem repassada ao usuário pelo `handleServerError`. Para "não autorizado",
"sem permissão" e "não encontrado", use `UnauthorizedError`, `ForbiddenError`,
`NotFoundError` de `core/shared/domain/errors.ts`.

## Autorização

Nunca cheque papel "na mão". Use o `Authorizer`:

| Método | Quando |
|---|---|
| `assertAuthenticated` | exige usuário logado |
| `assertMemberOfClinic` | qualquer papel da clínica (inclui staff) |
| `assertCanManageClinic` | owner/manager (config, equipe) |
| `assertCanAccessClinicalData` | dados clínicos (exclui staff) |

## Testes

```bash
npm run test          # roda tudo uma vez
npm run test:watch    # watch
```
Teste **domínio e casos de uso** com fakes. Evite testar infra com banco real;
prefira validar o contrato da porta no caso de uso.
