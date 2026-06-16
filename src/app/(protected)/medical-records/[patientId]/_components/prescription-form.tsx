"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertPrescription } from "@/actions/upsert-prescription";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Doctor, PrescriptionWithDoctor } from "./types";

const NO_DOCTOR = "none";

const formSchema = z.object({
  medication: z.string().trim().min(1, {
    message: "O medicamento é obrigatório.",
  }),
  dosage: z.string().trim().optional(),
  frequency: z.string().trim().optional(),
  duration: z.string().trim().optional(),
  instructions: z.string().trim().optional(),
  doctorId: z.string().optional(),
  date: z.date({ message: "A data é obrigatória." }),
});

type FormValues = z.infer<typeof formSchema>;

interface PrescriptionFormProps {
  patientId: string;
  doctors: Doctor[];
  prescription?: PrescriptionWithDoctor;
  onSuccess?: () => void;
}

export const PrescriptionForm = ({
  patientId,
  doctors,
  prescription,
  onSuccess,
}: PrescriptionFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medication: prescription?.medication ?? "",
      dosage: prescription?.dosage ?? "",
      frequency: prescription?.frequency ?? "",
      duration: prescription?.duration ?? "",
      instructions: prescription?.instructions ?? "",
      doctorId: prescription?.doctorId ?? NO_DOCTOR,
      date: prescription?.date ? new Date(prescription.date) : new Date(),
    },
  });

  const upsertPrescriptionAction = useAction(upsertPrescription, {
    onSuccess: () => {
      toast.success(
        prescription
          ? "Prescrição atualizada com sucesso."
          : "Prescrição adicionada com sucesso.",
      );
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar prescrição.");
    },
  });

  const onSubmit = (values: FormValues) => {
    upsertPrescriptionAction.execute({
      ...values,
      doctorId:
        values.doctorId && values.doctorId !== NO_DOCTOR
          ? values.doctorId
          : undefined,
      id: prescription?.id,
      patientId,
    });
  };

  const isPending = upsertPrescriptionAction.isPending;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {prescription ? "Editar prescrição" : "Adicionar prescrição"}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="medication"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicamento</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosagem</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex.: 500mg"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequência</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex.: 8/8h"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex.: 7 dias"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico responsável (opcional)</FormLabel>
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
                    <SelectItem value={NO_DOCTOR}>Não informar</SelectItem>
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
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
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
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instruções (opcional)</FormLabel>
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
