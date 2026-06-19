# Gestão e operação do sistema

## Papéis e permissões (RBAC)

### Papéis de plataforma
- **platform_admin** — operador do SaaS (você). Acessa `/admin`, enxerga todas as
  clínicas e passa em qualquer verificação de clínica.
- **member** — usuário comum (dono/equipe de clínica).

### Papéis de clínica
| Papel | Pode gerenciar clínica | Acessa dados clínicos | Observações |
|---|:--:|:--:|---|
| `owner` | ✅ | ✅ | dono da clínica |
| `manager` | ✅ | ✅ | gestor |
| `professional` | ❌ | ✅ | médico/dentista/psicólogo... |
| `staff` | ❌ | ❌ | recepção: agenda/pacientes, **sem prontuário** |

Definições em `core/modules/iam/domain/roles.ts`:
`CLINIC_MANAGEMENT_ROLES` (owner, manager) e `CLINICAL_DATA_ROLES`
(owner, manager, professional).

### Onde o RBAC é aplicado
- **Backend (fonte da verdade):** o `Authorizer` em cada caso de uso. Prontuário
  usa `assertCanAccessClinicalData` (barra `staff`), inclusive na **leitura**.
- **UI (conveniência):** a barra lateral oculta "Prontuários" para `staff`, e as
  páginas de prontuário redirecionam quem não tem acesso. A UI nunca é a única
  barreira — o caso de uso sempre revalida.

## Tornar um usuário admin de plataforma

Atualize o usuário no banco:

```sql
UPDATE users SET platform_role = 'platform_admin' WHERE email = 'voce@exemplo.com';
```

Faça logout/login para a sessão refletir o papel.

## Atribuir papéis de clínica

Os vínculos ficam em `users_to_clinics (user_id, clinic_id, role)`. Um usuário
pode pertencer a várias clínicas com papéis diferentes. O dono é criado como
`owner` ao cadastrar a clínica.

## Auditoria e LGPD

A tabela `audit_logs` registra ações sensíveis (quem, o quê, quando, em qual
clínica), incluindo **leitura de prontuário** (`medical_record.viewed`) e
escritas (`*.created/updated/deleted`). Use-a para trilha de conformidade.
Princípio de **mínimo necessário**: a recepção (`staff`) não vê dados clínicos.

## Assinaturas e planos

- O catálogo de planos é central: `core/modules/billing/domain/plans.ts`. Criar
  um plano novo = adicionar uma entrada ali (ver
  [administração e planos](08-administracao-e-planos.md)).
- A assinatura paga mora no usuário (`plan`, `stripe_customer_id`,
  `stripe_subscription_id`); webhooks do gateway ativam/desativam o plano.
- A plataforma pode conceder um **override de plano por clínica** (cortesia/
  desconto), com expiração opcional, sem depender do gateway. O override tem
  precedência sobre a assinatura.
- **Plano efetivo** = (clínica não bloqueada) e (override válido, senão a
  assinatura). O painel exige plano efetivo ativo.
- Trocar de gateway: [conectando gateways](06-gateways-de-pagamento.md).

## Bloqueio de clínicas

Em `/platform/clinics`, o admin pode bloquear/liberar o acesso de uma clínica.
Bloqueada (`status = 'blocked'`), seus usuários logam mas caem em
`/clinic-suspended` (com o motivo) e não acessam o sistema. Veja
[administração e planos](08-administracao-e-planos.md).

## WhatsApp multi-tenant

Cada clínica pode ter seu próprio número. Em **Configurações → Integração
WhatsApp** (visível para gestores), informe o **`phone_number_id`** (Meta) da
clínica. O webhook usa esse id para rotear a mensagem à clínica certa; sem
correspondência, cai na `WHATSAPP_DEFAULT_CLINIC_ID`.

Checklist para ligar o WhatsApp de uma clínica:
1. Configure o número na Meta (WhatsApp Cloud API) e pegue o `phone_number_id`.
2. Preencha o campo em Configurações.
3. Garanta as envs globais de envio (`WHATSAPP_API_URL`, `WHATSAPP_ACCESS_TOKEN`,
   etc.) e a de segurança (`WHATSAPP_APP_SECRET`).
4. Aponte o webhook da Meta para `/api/whatsapp/webhook` (verificação via
   `WHATSAPP_VERIFY_TOKEN`).

## Notificações da clínica

Confirmações de pacientes e avisos aparecem em `/notifications`. A barra lateral
mostra um **badge** com a contagem de não lidas (atualiza ao navegar e a cada
60s); abrir a página marca tudo como lido.

## Modo dev sem credenciais

Sem as credenciais de WhatsApp/QStash, o envio é apenas logado no console — útil
para desenvolver sem configurar provedores externos.
