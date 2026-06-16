"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertDiagnosis } from "@/actions/upsert-diagnosis";
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

import { diagnosisStatusLabels } from "./labels";
import { Diagnosis } from "./types";

const formSchema = z.object({
  description: z.string().trim().min(1, {
    message: "A descrição do diagnóstico é obrigatória.",
  }),
  cid10Code: z.string().trim().optional(),
  status: z.enum(["active", "resolved", "chronic"]),
  date: z.date({ message: "A data é obrigatória." }),
  notes: z.string().trim().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface DiagnosisFormProps {
  patientId: string;
  diagnosis?: Diagnosis;
  onSuccess?: () => void;
}

export const DiagnosisForm = ({
  patientId,
  diagnosis,
  onSuccess,
}: DiagnosisFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: diagnosis?.description ?? "",
      cid10Code: diagnosis?.cid10Code ?? "",
      status: diagnosis?.status ?? "active",
      date: diagnosis?.date ? new Date(diagnosis.date) : new Date(),
      notes: diagnosis?.notes ?? "",
    },
  });

  const upsertDiagnosisAction = useAction(upsertDiagnosis, {
    onSuccess: () => {
      toast.success(
        diagnosis
          ? "Diagnóstico atualizado com sucesso."
          : "Diagnóstico adicionado com sucesso.",
      );
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar diagnóstico.");
    },
  });

  const onSubmit = (values: FormValues) => {
    upsertDiagnosisAction.execute({
      ...values,
      id: diagnosis?.id,
      patientId,
    });
  };

  const isPending = upsertDiagnosisAction.isPending;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {diagnosis ? "Editar diagnóstico" : "Adicionar diagnóstico"}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="cid10Code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CID-10 (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex.: J45"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Situação</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(diagnosisStatusLabels).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data do diagnóstico</FormLabel>
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
