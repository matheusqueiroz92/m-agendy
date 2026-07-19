"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import { z } from "zod";

import { adminUpsertClinic } from "@/actions/admin-upsert-clinic";
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
import {
  CLINIC_TYPES,
  ClinicType,
  clinicTypeConfig,
} from "@/core/modules/clinics/domain/clinic-type";

import { ClinicRow } from "./clinics-manager";

/**
 * Nome/e-mail do responsável só são exigidos ao criar (sem `id`) — a edição
 * não mexe no responsável da clínica. Como o schema precisa saber se está em
 * modo de criação ou edição, ele é construído dentro do componente (via
 * `useMemo`) em vez de ser uma constante do módulo.
 */
const buildSchema = (isEditing: boolean) =>
  z.object({
    name: z.string().trim().min(1, "Nome é obrigatório."),
    type: z.enum(CLINIC_TYPES),
    ownerName: z.string().trim().optional(),
    ownerEmail: z.string().trim().optional(),
    ownerPhoneNumber: z.string().trim().optional(),
  }).superRefine((data, ctx) => {
    if (isEditing) return;
    if (!data.ownerName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ownerName"],
        message: "Nome do responsável é obrigatório.",
      });
    }
    if (!data.ownerEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ownerEmail"],
        message: "E-mail do responsável é obrigatório.",
      });
    } else if (!z.string().email().safeParse(data.ownerEmail).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ownerEmail"],
        message: "E-mail inválido.",
      });
    }
  });

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

interface UpsertClinicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ClinicRow | null;
}

const emptyValues: FormValues = {
  name: "",
  type: "medical",
  ownerName: "",
  ownerEmail: "",
  ownerPhoneNumber: "",
};

/**
 * Diálogo de criar/editar clínica pelo admin de plataforma. Na criação,
 * também coleta o responsável — ele recebe um e-mail para definir a senha e
 * acessar a clínica (ver ClinicOwnerProvisioner).
 */
export const UpsertClinicDialog = ({
  open,
  onOpenChange,
  editing,
}: UpsertClinicDialogProps) => {
  const isEditing = Boolean(editing);
  const schema = useMemo(() => buildSchema(isEditing), [isEditing]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  // Reseta o formulário sempre que o diálogo abre (nova clínica ou edição de
  // uma clínica diferente) — evita vazar dados de uma abertura para a outra.
  useEffect(() => {
    if (!open) return;
    form.reset({
      ...emptyValues,
      name: editing?.name ?? "",
      type: editing?.type ?? "medical",
    });
  }, [open, editing, form]);

  const upsert = useAction(adminUpsertClinic, {
    onSuccess: () => {
      toast.success(
        isEditing
          ? "Clínica atualizada."
          : "Clínica criada. O responsável receberá um e-mail para definir a senha.",
      );
      onOpenChange(false);
    },
    onError: () => toast.error("Não foi possível concluir a ação."),
  });

  const onSubmit = form.handleSubmit((values) => {
    upsert.execute({
      id: editing?.id,
      name: values.name,
      type: values.type,
      ownerName: isEditing ? undefined : values.ownerName,
      ownerEmail: isEditing ? undefined : values.ownerEmail,
      ownerPhoneNumber: isEditing ? undefined : values.ownerPhoneNumber,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar clínica" : "Nova clínica"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Defina o nome e o tipo da clínica."
              : "Defina a clínica e a pessoa responsável por ela — quem vai gerenciá-la no painel."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da clínica</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={upsert.isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => field.onChange(v as ClinicType)}
                    disabled={upsert.isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CLINIC_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {clinicTypeConfig[t].clinicLabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditing && (
              <>
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do responsável</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={upsert.isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail do responsável</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} disabled={upsert.isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerPhoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone do responsável (opcional)</FormLabel>
                      <FormControl>
                        <PatternFormat
                          format="(##) #####-####"
                          mask="_"
                          customInput={Input}
                          placeholder="(00) 00000-0000"
                          value={field.value}
                          onValueChange={(values) => field.onChange(values.value)}
                          disabled={upsert.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={upsert.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={upsert.isPending}>
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
