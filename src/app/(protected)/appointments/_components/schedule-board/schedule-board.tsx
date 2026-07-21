"use client";

import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { cancelAppointment } from "@/actions/cancel-appointment";
import { rescheduleAppointment } from "@/actions/reschedule-appointment";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  doctorAvailabilityWindowsTable,
  doctorsTable,
  appointmentsTable,
} from "@/db/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrencyInCents } from "@/helpers/currency";

import { UpsertAppointmentForm } from "../upsert-appointment-form";
import { ScheduleAppointment } from "./appointment-block";
import { ScheduleBoardToolbar } from "./schedule-board-toolbar";
import {
  addDays,
  formatTimeRange,
  isSameDay,
  startOfWeek,
} from "./schedule-constants";
import { ScheduleGrid } from "./schedule-grid";

type DoctorWithWindows = typeof doctorsTable.$inferSelect & {
  availabilityWindows?: (typeof doctorAvailabilityWindowsTable.$inferSelect)[];
};

type AppointmentRow = typeof appointmentsTable.$inferSelect & {
  patient: { id: string; name: string; email?: string; phoneNumber?: string };
  doctor: { id: string; name: string; speciality?: string };
};

interface ScheduleBoardProps {
  doctors: DoctorWithWindows[];
  appointments: AppointmentRow[];
  toolbarLeading?: ReactNode;
}

export function ScheduleBoard({
  doctors,
  appointments,
  toolbarLeading,
}: ScheduleBoardProps) {
  const isMobile = useIsMobile();
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    doctors[0]?.id ?? "",
  );
  const [mode, setMode] = useState<"day" | "week">("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<{
    doctorId?: string;
    date?: Date;
    time?: string;
    durationInMinutes?: number;
  }>({});
  const [details, setDetails] = useState<ScheduleAppointment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [optimistic, setOptimistic] = useState<AppointmentRow[]>(appointments);

  useEffect(() => {
    setOptimistic(appointments);
  }, [appointments]);

  useEffect(() => {
    if (isMobile) setMode("day");
  }, [isMobile]);

  useEffect(() => {
    if (!selectedDoctorId && doctors[0]) {
      setSelectedDoctorId(doctors[0].id);
    }
  }, [doctors, selectedDoctorId]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);
  const windows = selectedDoctor?.availabilityWindows ?? [];

  const visibleDays = useMemo(() => {
    if (mode === "day" || isMobile) {
      const d = new Date(anchorDate);
      d.setHours(0, 0, 0, 0);
      return [d];
    }
    const start = startOfWeek(anchorDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [anchorDate, mode, isMobile]);

  const boardAppointments: ScheduleAppointment[] = useMemo(() => {
    return optimistic
      .filter(
        (a) =>
          a.doctorId === selectedDoctorId &&
          (a.status === "pending" || a.status === "confirmed") &&
          visibleDays.some((day) => isSameDay(day, new Date(a.date))),
      )
      .map((a) => ({
        id: a.id,
        date: new Date(a.date),
        durationInMinutes: a.durationInMinutes ?? 30,
        status: a.status,
        patientName: a.patient.name,
        doctorId: a.doctorId,
        patientId: a.patientId,
        appointmentPriceInCents: a.appointmentPriceInCents,
        type: a.type,
      }));
  }, [optimistic, selectedDoctorId, visibleDays]);

  const rescheduleAction = useAction(rescheduleAppointment, {
    onError: ({ error }) => {
      setOptimistic(appointments);
      toast.error(error.serverError ?? "Não foi possível reagendar.");
    },
  });

  const cancelAction = useAction(cancelAppointment, {
    onSuccess: () => {
      toast.success("Agendamento cancelado.");
      setCancelOpen(false);
      setDetails(null);
    },
    onError: () => toast.error("Erro ao cancelar agendamento."),
  });

  const handleReschedule = (
    appointmentId: string,
    scheduledAt: Date,
    durationInMinutes: number,
  ) => {
    setOptimistic((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? { ...a, date: scheduledAt, durationInMinutes }
          : a,
      ),
    );

    const time = `${String(scheduledAt.getHours()).padStart(2, "0")}:${String(scheduledAt.getMinutes()).padStart(2, "0")}`;
    rescheduleAction.execute({
      id: appointmentId,
      date: scheduledAt,
      time,
      durationInMinutes,
    });
  };

  if (doctors.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
        Cadastre um profissional para visualizar o quadro de horários.
      </div>
    );
  }

  const editingAppointment = details
    ? optimistic.find((a) => a.id === details.id)
    : undefined;

  return (
    <div className="space-y-4">
      <ScheduleBoardToolbar
        doctors={doctors}
        selectedDoctorId={selectedDoctorId}
        onDoctorChange={setSelectedDoctorId}
        mode={isMobile ? "day" : mode}
        onModeChange={setMode}
        visibleDays={visibleDays}
        isMobile={isMobile}
        leading={toolbarLeading}
        onPrev={() =>
          setAnchorDate((d) => addDays(d, mode === "week" && !isMobile ? -7 : -1))
        }
        onNext={() =>
          setAnchorDate((d) => addDays(d, mode === "week" && !isMobile ? 7 : 1))
        }
        onToday={() => setAnchorDate(new Date())}
      />

      {windows.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Este profissional não possui horários de atendimento cadastrados. O
          quadro aparece bloqueado.
        </p>
      )}

      <ScheduleGrid
        days={visibleDays}
        appointments={boardAppointments}
        windows={windows.map((w) => ({
          weekDay: w.weekDay,
          startTime: w.startTime,
          endTime: w.endTime,
        }))}
        onEmptySlotClick={(day, time) => {
          setCreateDefaults({
            doctorId: selectedDoctorId,
            date: day,
            time,
            durationInMinutes:
              selectedDoctor?.defaultAppointmentDurationInMinutes ?? 30,
          });
          setCreateOpen(true);
        }}
        onAppointmentClick={setDetails}
        onReschedule={handleReschedule}
      />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        {createOpen && (
          <UpsertAppointmentForm
            key={`${createDefaults.date?.toISOString()}-${createDefaults.time}`}
            doctors={doctors}
            defaultValues={createDefaults}
            onSuccess={() => setCreateOpen(false)}
          />
        )}
      </Dialog>

      <Dialog
        open={Boolean(details) && !editOpen}
        onOpenChange={(open) => {
          if (!open) setDetails(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do agendamento</DialogTitle>
          </DialogHeader>
          {details && (
            <div className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Paciente: </span>
                {details.patientName}
              </p>
              <p>
                <span className="text-muted-foreground">Horário: </span>
                {formatTimeRange(details.date, details.durationInMinutes)}
              </p>
              <p>
                <span className="text-muted-foreground">Duração: </span>
                {details.durationInMinutes} min
              </p>
              <p>
                <span className="text-muted-foreground">Tipo: </span>
                {details.type === "return_visit" ? "Retorno" : "Consulta"}
              </p>
              <p>
                <span className="text-muted-foreground">Status: </span>
                {details.status === "confirmed" ? "Confirmado" : "Pendente"}
              </p>
              <p>
                <span className="text-muted-foreground">Valor: </span>
                {formatCurrencyInCents(details.appointmentPriceInCents)}
              </p>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="flex-1"
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setCancelOpen(true)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        {editingAppointment && (
          <UpsertAppointmentForm
            doctors={doctors}
            appointment={editingAppointment}
            onSuccess={() => {
              setEditOpen(false);
              setDetails(null);
            }}
          />
        )}
      </Dialog>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação cancela a consulta. O paciente poderá ser notificado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (details) {
                  cancelAction.execute({ id: details.id });
                }
              }}
            >
              Confirmar cancelamento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
