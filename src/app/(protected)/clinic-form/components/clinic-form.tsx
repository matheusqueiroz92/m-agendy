"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { createClinic } from "@/actions/create-clinic";
import {
  CLINIC_TYPES,
  clinicTypeConfig,
} from "@/core/modules/clinics/domain/clinic-type";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
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

const clinicFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Nome da clínica é obrigatório." }),
  type: z.enum(CLINIC_TYPES, { message: "Selecione o tipo de clínica." }),
});

export const ClinicForm = () => {
  const clinicForm = useForm<z.infer<typeof clinicFormSchema>>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: {
      name: "",
      type: "medical",
    },
  });

  const onSubmitClinic = async (data: z.infer<typeof clinicFormSchema>) => {
    try {
      await createClinic(data.name, data.type);
    } catch (error) {
      if (isRedirectError(error)) {
        return;
      }
      console.error(error);
      toast.error("Erro ao criar clínica");
    }
  };
  return (
    <>
      <Form {...clinicForm}>
        <form
          className="space-y-6"
          onSubmit={clinicForm.handleSubmit(onSubmitClinic)}
        >
          <FormField
            control={clinicForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da clínica</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome da clínica" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={clinicForm.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de clínica</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CLINIC_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {clinicTypeConfig[type].clinicLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={clinicForm.formState.isSubmitting}
            >
              {clinicForm.formState.isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Criar clínica
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};
