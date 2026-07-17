"use client";

import { CalendarXIcon, EditIcon, MoreVerticalIcon, XCircleIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { cancelAppointment } from "@/actions/cancel-appointment";
import { markAppointmentNoShow } from "@/actions/mark-appointment-no-show";
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
import { Dialog } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

import { UpsertAppointmentForm } from "./upsert-appointment-form";

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  doctor: {
    id: string;
    name: string;
    speciality: string;
  };
};

interface AppointmentTableActionsProps {
  appointment: AppointmentWithRelations;
  doctors: (typeof doctorsTable.$inferSelect)[];
  patients: (typeof patientsTable.$inferSelect)[];
}

export const AppointmentTableActions = ({
  appointment,
  doctors,
  patients,
}: AppointmentTableActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState(false);

  const cancelAppointmentAction = useAction(cancelAppointment, {
    onSuccess: () => {
      toast.success("Agendamento cancelado. O paciente foi avisado por WhatsApp.");
    },
    onError: () => {
      toast.error("Erro ao cancelar agendamento.");
    },
  });

  const markNoShowAction = useAction(markAppointmentNoShow, {
    onSuccess: () => {
      toast.success("Agendamento marcado como falta.");
    },
    onError: () => {
      toast.error("Erro ao marcar falta.");
    },
  });

  const handleCancelAppointmentClick = () => {
    if (!appointment) return;
    cancelAppointmentAction.execute({ id: appointment.id });
  };

  const handleMarkNoShowClick = () => {
    if (!appointment) return;
    markNoShowAction.execute({ id: appointment.id });
  };

  return (
    <Dialog open={upsertDialogIsOpen} onOpenChange={setUpsertDialogIsOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>
            {appointment.patient.name} - {appointment.doctor.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setUpsertDialogIsOpen(true)}>
            <EditIcon className="h-4 w-4" /> Editar
          </DropdownMenuItem>
          {appointment.status !== "no_show" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <CalendarXIcon className="h-4 w-4" /> Marcar falta
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Marcar falta de {appointment.patient.name}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    O agendamento com {appointment.doctor.name} será marcado
                    como falta. Isso não remove o registro nem envia aviso ao
                    paciente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleMarkNoShowClick}
                    disabled={markNoShowAction.isPending}
                  >
                    {markNoShowAction.isPending ? "Marcando..." : "Marcar falta"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {appointment.status !== "cancelled" &&
            appointment.status !== "no_show" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <XCircleIcon className="h-4 w-4" /> Cancelar agendamento
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Cancelar o agendamento de {appointment.patient.name}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      O agendamento com {appointment.doctor.name} será
                      marcado como cancelado (o histórico é mantido) e o
                      paciente será avisado por WhatsApp.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Voltar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelAppointmentClick}
                      disabled={cancelAppointmentAction.isPending}
                    >
                      {cancelAppointmentAction.isPending
                        ? "Cancelando..."
                        : "Cancelar agendamento"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
        </DropdownMenuContent>
      </DropdownMenu>

      <UpsertAppointmentForm
        appointment={appointment}
        doctors={doctors}
        patients={patients}
        onSuccess={() => setUpsertDialogIsOpen(false)}
      />
    </Dialog>
  );
};
