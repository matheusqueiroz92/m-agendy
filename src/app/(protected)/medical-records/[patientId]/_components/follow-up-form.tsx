"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { upsertFollowUp } from "@/actions/upsert-follow-up";
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

import { followUpStatusLabels } from "./labels";
import { FollowUp } from "./types";

const formSchema = z.object({
  title: z.string().trim().min(1, {
    message: "O título é obrigatório.",
  }),
  description: z.string().trim().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  scheduledDate: z.date().optional(),
  completedDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface FollowUpFormProps {
  patientId: string;
  followUp?: FollowUp;
  onSuccess?: () => void;
}

export const FollowUpForm = ({
  patientId,
  followUp,
  onSuccess,
}: FollowUpFormProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: followUp?.title ?? "",
      description: followUp?.description ?? "",
      status: followUp?.status ?? "pending",
      scheduledDate: followUp?.scheduledDate
        ? new Date(followUp.scheduledDate)
        : undefined,
      completedDate: followUp?.completedDate
        ? new Date(followUp.completedDate)
        : undefined,
    },
  });

  const upsertFollowUpAction = useAction(upsertFollowUp, {
    onSuccess: () => {
      toast.success(
        followUp
          ? "Acompanhamento atualizado com sucesso."
          : "Acompanhamento adicionado com sucesso.",
      );
      onSuccess?.();
    },
    onError: () => {
      toast.error("Erro ao salvar acompanhamento.");
    },
  });

  const onSubmit = (values: FormValues) => {
    upsertFollowUpAction.execute({
      ...values,
      id: followUp?.id,
      patientId,
    });
  };

  const isPending = upsertFollowUpAction.isPending;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {followUp ? "Editar acompanhamento" : "Adicionar acompanhamento"}
        </DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ex.: Controle de pressão arterial"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (opcional)</FormLabel>
                <FormControl>
                  <Textarea {...field} disabled={isPending} />
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
                    {Object.entries(followUpStatusLabels).map(
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data prevista de retorno</FormLabel>
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
              name="completedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de conclusão</FormLabel>
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
          </div>
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
