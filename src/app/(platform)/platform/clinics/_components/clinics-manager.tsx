"use client";

import dayjs from "dayjs";
import { Ban, CheckCircle2, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { adminDeleteClinic } from "@/actions/admin-delete-clinic";
import { adminSetClinicPlan } from "@/actions/admin-set-clinic-plan";
import { adminSetClinicStatus } from "@/actions/admin-set-clinic-status";
import { adminUpsertClinic } from "@/actions/admin-upsert-clinic";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  CLINIC_TYPES,
  ClinicType,
  clinicTypeConfig,
} from "@/core/modules/clinics/domain/clinic-type";
import {
  getPlanLabel,
  PLAN_CATALOG,
} from "@/core/modules/billing/domain/plans";

export interface ClinicRow {
  id: string;
  name: string;
  type: ClinicType;
  status: "active" | "blocked";
  blockedReason: string | null;
  planOverride: string | null;
  planOverrideExpiresAt: string | null;
  basePlan: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  createdAt: string;
  patientsCount: number;
  doctorsCount: number;
  appointmentsCount: number;
  membersCount: number;
}

const onErr = () => toast.error("Não foi possível concluir a ação.");

export const ClinicsManager = ({ clinics }: { clinics: ClinicRow[] }) => {
  const [editing, setEditing] = useState<ClinicRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ClinicType>("medical");

  const [blocking, setBlocking] = useState<ClinicRow | null>(null);
  const [reason, setReason] = useState("");

  const [planning, setPlanning] = useState<ClinicRow | null>(null);
  const [plan, setPlan] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [deleting, setDeleting] = useState<ClinicRow | null>(null);

  const upsert = useAction(adminUpsertClinic, {
    onSuccess: () => {
      toast.success("Clínica salva.");
      setEditOpen(false);
    },
    onError: onErr,
  });
  const setStatus = useAction(adminSetClinicStatus, {
    onSuccess: () => {
      toast.success("Status atualizado.");
      setBlocking(null);
      setReason("");
    },
    onError: onErr,
  });
  const setPlanAction = useAction(adminSetClinicPlan, {
    onSuccess: () => {
      toast.success("Plano atualizado.");
      setPlanning(null);
    },
    onError: onErr,
  });
  const remove = useAction(adminDeleteClinic, {
    onSuccess: () => {
      toast.success("Clínica excluída.");
      setDeleting(null);
    },
    onError: onErr,
  });

  const openNew = () => {
    setEditing(null);
    setName("");
    setType("medical");
    setEditOpen(true);
  };

  const openEdit = (c: ClinicRow) => {
    setEditing(c);
    setName(c.name);
    setType(c.type);
    setEditOpen(true);
  };

  const openPlan = (c: ClinicRow) => {
    setPlanning(c);
    setPlan(c.planOverride ?? "");
    setExpiresAt(c.planOverrideExpiresAt ? c.planOverrideExpiresAt.slice(0, 10) : "");
  };

  const planLabel = (c: ClinicRow) => {
    if (c.planOverride) {
      const exp = c.planOverrideExpiresAt
        ? ` até ${dayjs(c.planOverrideExpiresAt).format("DD/MM/YYYY")}`
        : "";
      return `Cortesia: ${getPlanLabel(c.planOverride)}${exp}`;
    }
    return getPlanLabel(c.basePlan);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> Nova clínica
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Clínica</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Pacientes</TableHead>
            <TableHead>Consultas</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clinics.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">
                {c.name}
                <span className="text-muted-foreground block text-xs">
                  {clinicTypeConfig[c.type].clinicLabel}
                </span>
              </TableCell>
              <TableCell className="text-sm">
                {c.ownerEmail ?? "—"}
              </TableCell>
              <TableCell>
                {c.status === "blocked" ? (
                  <Badge variant="destructive">Bloqueada</Badge>
                ) : (
                  <Badge variant="secondary">Ativa</Badge>
                )}
              </TableCell>
              <TableCell className="text-sm">{planLabel(c)}</TableCell>
              <TableCell>{c.patientsCount}</TableCell>
              <TableCell>{c.appointmentsCount}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Ações">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(c)}>
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openPlan(c)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Plano
                    </DropdownMenuItem>
                    {c.status === "active" ? (
                      <DropdownMenuItem onClick={() => setBlocking(c)}>
                        <Ban className="mr-2 h-4 w-4" /> Bloquear
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() =>
                          setStatus.execute({ clinicId: c.id, status: "active" })
                        }
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Liberar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleting(c)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Criar/editar */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar clínica" : "Nova clínica"}</DialogTitle>
            <DialogDescription>
              Defina o nome e o tipo da clínica.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as ClinicType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLINIC_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {clinicTypeConfig[t].clinicLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={upsert.isPending}
              onClick={() =>
                upsert.execute({ id: editing?.id, name, type })
              }
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bloquear (com motivo) */}
      <Dialog open={!!blocking} onOpenChange={(o) => !o && setBlocking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bloquear acesso</DialogTitle>
            <DialogDescription>
              A clínica &quot;{blocking?.name}&quot; verá uma tela de suspensão e
              não acessará o sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Motivo (opcional, exibido à clínica)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex.: pagamento pendente"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlocking(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={setStatus.isPending}
              onClick={() =>
                blocking &&
                setStatus.execute({
                  clinicId: blocking.id,
                  status: "blocked",
                  reason,
                })
              }
            >
              Bloquear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plano (override) */}
      <Dialog open={!!planning} onOpenChange={(o) => !o && setPlanning(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plano da clínica</DialogTitle>
            <DialogDescription>
              Conceda cortesia/desconto independente do gateway. &quot;Nenhum&quot;
              volta a usar o plano da assinatura do responsável.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plano concedido</Label>
              <Select value={plan || "none"} onValueChange={(v) => setPlan(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum (usar assinatura)</SelectItem>
                  {PLAN_CATALOG.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label} (cortesia)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {plan && (
              <div className="space-y-2">
                <Label>Expira em (opcional)</Label>
                <Input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanning(null)}>
              Cancelar
            </Button>
            <Button
              disabled={setPlanAction.isPending}
              onClick={() =>
                planning &&
                setPlanAction.execute({
                  clinicId: planning.id,
                  planOverride: plan,
                  expiresAt: expiresAt || undefined,
                })
              }
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excluir */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir clínica?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação remove &quot;{deleting?.name}&quot; e seus dados
              vinculados. Não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleting && remove.execute({ clinicId: deleting.id })
              }
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
