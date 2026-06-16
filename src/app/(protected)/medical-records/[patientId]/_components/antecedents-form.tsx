"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertMedicalRecord } from "@/actions/upsert-medical-record";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { MedicalRecord } from "./types";

const formSchema = z.object({
  bloodType: z.string().trim().optional(),
  allergies: z.string().trim().optional(),
  medicationsInUse: z.string().trim().optional(),
  clinicalHistory: z.string().trim().optional(),
  surgicalHistory: z.string().trim().optional(),
  familyHistory: z.string().trim().optional(),
  habits: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AntecedentsFormProps {
  patientId: string;
  medicalRecord: MedicalRecord | null;
  onSuccess?: () => void;
}

export const AntecedentsForm = ({
  patientId,
  medicalRecord,
  onSuccess,
}: AntecedentsFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bloodType: medicalRecord?.bloodType ?? "",
      allergies: medicalRecord?.allergies ?? "",
      medicationsInUse: medicalRecord?.medicationsInUse ?? "",
      clinicalHistory: medicalRecord?.clinicalHistory ?? "",
      surgicalHistory: medicalRecord?.surgicalHistory ?? "",
      familyHistory: medicalRecord?.familyHistory ?? "",
      habits: medicalRecord?.habits ?? "",
      notes: medicalRecord?.notes ?? "",
    },
  });

  const upsertMedicalRecordAction = useAction(upsertMedicalRecord, {
    onSuccess: () => {
      toast.success("Antecedentes salvos com sucesso.");
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar antecedentes.");
    },
  });

  const onSubmit = (values: FormValues) => {
    upsertMedicalRecordAction.execute({ ...values, patientId });
  };

  const isPending = upsertMedicalRecordAction.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="bloodType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo sanguíneo</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex.: O+"
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="allergies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alergias</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Ex.: Penicilina, dipirona..."
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="medicationsInUse"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medicamentos em uso</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Liste os medicamentos de uso contínuo..."
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clinicalHistory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Antecedentes clínicos</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Doenças prévias, condições crônicas..."
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="surgicalHistory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Antecedentes cirúrgicos</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Cirurgias realizadas e datas..."
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="familyHistory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Antecedentes familiares</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Histórico de doenças na família..."
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="habits"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hábitos</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Tabagismo, álcool, atividade física, alimentação..."
                  disabled={isPending}
                />
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
              <FormLabel>Observações gerais</FormLabel>
              <FormControl>
                <Textarea {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Salvando..." : "Salvar antecedentes"}
        </Button>
      </form>
    </Form>
  );
};
