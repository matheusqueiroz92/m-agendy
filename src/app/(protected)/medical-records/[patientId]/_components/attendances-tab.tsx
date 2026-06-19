"use client";

import { useProfessionalLabels } from "@/hooks/use-professional-labels";

import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteClinicalAttendance } from "@/actions/delete-clinical-attendance";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { AttendanceForm } from "./attendance-form";
import { formatDateTime } from "./labels";
import { AppointmentWithDoctor, AttendanceWithDoctor, Doctor } from "./types";

interface AttendancesTabProps {
  patientId: string;
  attendances: AttendanceWithDoctor[];
  appointments: AppointmentWithDoctor[];
  doctors: Doctor[];
}

const Field = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value || value.trim().length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm whitespace-pre-wrap">{value}</p>
    </div>
  );
};

export const AttendancesTab = ({
  patientId,
  attendances,
  appointments,
  doctors,
}: AttendancesTabProps) => {
  const { singular: professionalLabel } = useProfessionalLabels();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const deleteAttendanceAction = useAction(deleteClinicalAttendance, {
    onSuccess: () => toast.success("Atendimento removido."),
    onError: () => toast.error("Erro ao remover atendimento."),
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Atendimentos</CardTitle>
          <CardDescription>
            Registros clínicos das consultas (queixa, anamnese, exame físico e
            conduta).
          </CardDescription>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-1 h-4 w-4" />
              Registrar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <AttendanceForm
              patientId={patientId}
              doctors={doctors}
              appointments={appointments}
              onSuccess={() => setIsAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {attendances.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Nenhum atendimento registrado.
          </p>
        ) : (
          attendances.map((attendance) => (
            <div key={attendance.id} className="rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">
                    {formatDateTime(attendance.date)}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {attendance.doctor?.name ?? `${professionalLabel} não informado`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Dialog
                    open={editingId === attendance.id}
                    onOpenChange={(open) =>
                      setEditingId(open ? attendance.id : null)
                    }
                  >
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <EditIcon className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                      <AttendanceForm
                        patientId={patientId}
                        doctors={doctors}
                        appointments={appointments}
                        attendance={attendance}
                        onSuccess={() => setEditingId(null)}
                      />
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Remover atendimento?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Essa ação não pode ser revertida.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            deleteAttendanceAction.execute({
                              id: attendance.id,
                              patientId,
                            })
                          }
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Queixa principal" value={attendance.chiefComplaint} />
                <Field
                  label="História da doença atual"
                  value={attendance.historyOfPresentIllness}
                />
                <Field label="Exame físico" value={attendance.physicalExam} />
                <Field label="Conduta / plano" value={attendance.conduct} />
                <Field label="Observações" value={attendance.notes} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
