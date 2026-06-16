"use client";

import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteDiagnosis } from "@/actions/delete-diagnosis";
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

import { DiagnosisForm } from "./diagnosis-form";
import { diagnosisStatusLabels, formatDate } from "./labels";
import { Diagnosis } from "./types";

interface DiagnosesTabProps {
  patientId: string;
  diagnoses: Diagnosis[];
}

const DiagnosisRowActions = ({
  patientId,
  diagnosis,
}: {
  patientId: string;
  diagnosis: Diagnosis;
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const deleteDiagnosisAction = useAction(deleteDiagnosis, {
    onSuccess: () => toast.success("Diagnóstico removido."),
    onError: () => toast.error("Erro ao remover diagnóstico."),
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
          <DiagnosisForm
            patientId={patientId}
            diagnosis={diagnosis}
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
            <AlertDialogTitle>Remover diagnóstico?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteDiagnosisAction.execute({
                  id: diagnosis.id,
                  patientId,
                })
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

export const DiagnosesTab = ({ patientId, diagnoses }: DiagnosesTabProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Diagnósticos</CardTitle>
          <CardDescription>
            Diagnósticos registrados para o paciente.
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
            <DiagnosisForm
              patientId={patientId}
              onSuccess={() => setIsAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {diagnoses.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Nenhum diagnóstico registrado.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>CID-10</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagnoses.map((diagnosis) => (
                <TableRow key={diagnosis.id}>
                  <TableCell>{formatDate(diagnosis.date)}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {diagnosis.description}
                  </TableCell>
                  <TableCell>{diagnosis.cid10Code ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {diagnosisStatusLabels[diagnosis.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DiagnosisRowActions
                      patientId={patientId}
                      diagnosis={diagnosis}
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
