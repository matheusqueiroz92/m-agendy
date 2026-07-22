"use client";

import dayjs from "dayjs";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { completeWhatsAppIntegrationRequest } from "@/actions/complete-whatsapp-integration-request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataNotFound } from "@/components/ui/data-not-found";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPlanLabel } from "@/core/modules/billing/domain/plans";

export interface WhatsAppIntegrationRequestRow {
  id: string;
  clinicId: string;
  clinicName: string;
  clinicPlan: string | null;
  ownerPhoneNumber: string | null;
  status: "pending" | "completed";
  phoneNumberId: string | null;
  createdAt: string;
  completedAt: string | null;
}

export const WhatsAppRequestsManager = ({
  requests,
}: {
  requests: WhatsAppIntegrationRequestRow[];
}) => {
  const [completing, setCompleting] =
    useState<WhatsAppIntegrationRequestRow | null>(null);
  const [phoneNumberId, setPhoneNumberId] = useState("");

  const complete = useAction(completeWhatsAppIntegrationRequest, {
    onSuccess: () => {
      toast.success("Integração concluída! A clínica foi avisada.");
      setCompleting(null);
      setPhoneNumberId("");
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Não foi possível concluir a solicitação.");
    },
  });

  const openComplete = (r: WhatsAppIntegrationRequestRow) => {
    setCompleting(r);
    setPhoneNumberId("");
  };

  if (requests.length === 0) {
    return (
      <DataNotFound
        icon={<MessageCircle className="text-muted-foreground h-8 w-8" />}
        title="Nenhuma solicitação"
        description="Quando uma clínica Premium/Gold pedir para integrar o próprio número de WhatsApp, a solicitação aparece aqui."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Clínica</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Solicitado em</TableHead>
            <TableHead>phone_number_id</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.clinicName}</TableCell>
              <TableCell className="text-sm">
                {r.ownerPhoneNumber ?? "—"}
              </TableCell>
              <TableCell className="text-sm">
                {getPlanLabel(r.clinicPlan)}
              </TableCell>
              <TableCell>
                {r.status === "pending" ? (
                  <Badge variant="outline">Pendente</Badge>
                ) : (
                  <Badge variant="secondary">Concluída</Badge>
                )}
              </TableCell>
              <TableCell className="text-sm">
                {dayjs(r.createdAt).format("DD/MM/YYYY HH:mm")}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {r.phoneNumberId ?? "—"}
              </TableCell>
              <TableCell>
                {r.status === "pending" && (
                  <Button size="sm" onClick={() => openComplete(r)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Concluir
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!completing}
        onOpenChange={(o) => !o && setCompleting(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Concluir integração</DialogTitle>
            <DialogDescription>
              Cole o <strong>phone_number_id</strong> do número configurado no
              Meta Business Manager para &quot;{completing?.clinicName}
              &quot;. A clínica será avisada assim que você salvar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>phone_number_id</Label>
            <Input
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value)}
              placeholder="Ex.: 123456789012345"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleting(null)}>
              Cancelar
            </Button>
            <Button
              disabled={complete.isPending || !phoneNumberId.trim()}
              onClick={() =>
                completing &&
                complete.execute({
                  requestId: completing.id,
                  phoneNumberId,
                })
              }
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
