"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertClinicalAttendance } from "@/actions/upsert-clinical-attendance";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { formatDateTime } from "./labels";
import { AppointmentWithDoctor, AttendanceWithDoctor, Doctor } from "./types";

const NONE = "none";

const formSchema = z.object({
  date: z.date({ message: "A data é obrigatória." }),
  doctorId: z.string().optional(),
  appointmentId: z.string().optional(),
  chiefComplaint: z.string().trim().optional(),
  historyOfPresentIllness: z.string().trim().optional(),
  physicalExam: z.string().trim().optional(),
  conduct: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AttendanceFormProps {
  patientId: string;
  doctors: Doctor[];
  appointments: AppointmentWithDoctor[];
  attendance?: AttendanceWithDoctor;
  onSuccess?: () => void;
}

export const AttendanceForm = ({
  patientId,
  doctors,
  appointments,
  attendance,
  onSuccess,
}: AttendanceFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: attendance?.date ? new Date(attendance.date) : new Date(),
      doctorId: attendance?.doctorId ?? NONE,
      appointmentId: attendance?.appointmentId ?? NONE,
      chiefComplaint: attendance?.chiefComplaint ?? "",
      historyOfPresentIllness: attendance?.historyOfPresentIllness ?? "",
      physicalExam: attendance?.physicalExam ?? "",
      conduct: attendance?.conduct ?? "",
      notes: attendance?.notes ?? "",
    },
  });

  const upsertAttendanceAction = useAction(upsertClinicalAttendance, {
    onSuccess: () => {
      toast.success(
        attendance
          ? "Atendimento atualizado com sucesso."
          : "Atendimento adicionado com sucesso.",
      );
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar atendimento.");
    },
  });

  const onSubmit = (values: FormValues) => {
    upsertAttendanceAction.execute({
      ...values,
      doctorId: values.doctorId !== NONE ? values.doctorId : undefined,
      appointmentId:
        values.appointmentId !== NONE ? values.appointmentId : undefined,
      id: attendance?.id,
      patientId,
    });
  };

  const isPending = upsertAttendanceAction.isPending;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {attendance ? "Editar atendimento" : "Registrar atendimento"}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data do atendimento</FormLabel>
                  <FormControl>
                    <DatePicker
                      date={field.value}
                      onSelect={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Médico</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o médico" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NONE}>Não informar</SelectItem>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="appointmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Consulta vinculada (opcional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isPending}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Vincular a uma consulta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>Não vincular</SelectItem>
                    {appointments.map((appointment) => (
                      <SelectItem key={appointment.id} value={appointment.id}>
                        {formatDateTime(appointment.date)} ·{" "}
                        {appointment.doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chiefComplaint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Queixa principal</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="historyOfPresentIllness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>História da doença atual</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="physicalExam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exame físico</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="conduct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conduta / plano</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações (opcional)</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};
