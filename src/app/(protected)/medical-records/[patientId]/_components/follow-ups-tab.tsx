"use client";

import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteFollowUp } from "@/actions/delete-follow-up";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { FollowUpForm } from "./follow-up-form";
import { followUpStatusLabels, formatDate } from "./labels";
import { FollowUp } from "./types";

interface FollowUpsTabProps {
  patientId: string;
  followUps: FollowUp[];
}

const FollowUpRowActions = ({
  patientId,
  followUp,
}: {
  patientId: string;
  followUp: FollowUp;
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const deleteFollowUpAction = useAction(deleteFollowUp, {
    onSuccess: () => toast.success("Acompanhamento removido."),
    onError: () => toast.error("Erro ao remover acompanhamento."),
  });

  return (
    <div className="flex justify-end gap-1">
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <EditIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <FollowUpForm
            patientId={patientId}
            followUp={followUp}
            onSuccess={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <TrashIcon className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover acompanhamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteFollowUpAction.execute({ id: followUp.id, patientId })
              }
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const FollowUpsTab = ({ patientId, followUps }: FollowUpsTabProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Acompanhamentos</CardTitle>
          <CardDescription>
            Plano de seguimento, retornos e metas terapêuticas.
          </CardDescription>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-1 h-4 w-4" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <FollowUpForm
              patientId={patientId}
              onSuccess={() => setIsAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {followUps.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Nenhum acompanhamento registrado.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Retorno previsto</TableHead>
                <TableHead>Conclusão</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {followUps.map((followUp) => (
                <TableRow key={followUp.id}>
                  <TableCell className="font-medium">
                    {followUp.title}
                  </TableCell>
                  <TableCell>{formatDate(followUp.scheduledDate)}</TableCell>
                  <TableCell>{formatDate(followUp.completedDate)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {followUpStatusLabels[followUp.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <FollowUpRowActions
                      patientId={patientId}
                      followUp={followUp}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
