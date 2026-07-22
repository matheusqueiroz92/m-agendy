"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Send } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { sendMarketingEmail } from "@/actions/send-marketing-email";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";

const composerSchema = z.object({
  subject: z.string().trim().min(1, "Informe o assunto do e-mail."),
  body: z.string().trim().min(1, "Informe o conteúdo do e-mail."),
});

type ComposerFormData = z.infer<typeof composerSchema>;

export const MarketingEmailComposer = ({
  recipientCount,
}: {
  recipientCount: number;
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const form = useForm<ComposerFormData>({
    resolver: zodResolver(composerSchema),
    defaultValues: { subject: "", body: "" },
  });

  const send = useAction(sendMarketingEmail, {
    onSuccess: ({ data }) => {
      toast.success(
        `E-mail enviado para ${data?.sentCount ?? 0} destinatário(s)` +
          (data && data.failedCount > 0
            ? ` (${data.failedCount} falha(s))`
            : "."),
      );
      form.reset();
      setConfirmOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Não foi possível enviar o e-mail.");
      setConfirmOpen(false);
    },
  });

  const onConfirm = () => {
    send.execute(form.getValues());
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Novo disparo
          </CardTitle>
          <CardDescription>
            Vai para{" "}
            <Badge variant="secondary">
              {recipientCount} destinatário(s)
            </Badge>{" "}
            com opt-in ativo agora. Quem desativou "Emails de Marketing" não
            recebe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(() => setConfirmOpen(true))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assunto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex.: Novidades no M.Agendy este mês"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={10}
                        placeholder="Escreva a novidade, promoção ou aviso..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={recipientCount === 0 || send.isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Revisar e enviar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar envio</DialogTitle>
            <DialogDescription>
              Este e-mail será enviado para{" "}
              <strong>{recipientCount} destinatário(s)</strong> agora, sem
              possibilidade de cancelar depois de iniciado. Confirma o envio?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={send.isPending} onClick={onConfirm}>
              {send.isPending ? "Enviando..." : "Confirmar e enviar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
