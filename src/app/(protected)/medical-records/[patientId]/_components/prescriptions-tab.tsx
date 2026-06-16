"use client";

import { EditIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deletePrescription } from "@/actions/delete-prescription";
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

import { formatDate } from "./labels";
import { PrescriptionForm } from "./prescription-form";
import { Doctor, PrescriptionWithDoctor } from "./types";

interface PrescriptionsTabProps {
  patientId: string;
  prescriptions: PrescriptionWithDoctor[];
  doctors: Doctor[];
}

const PrescriptionRowActions = ({
  patientId,
  doctors,
  prescription,
}: {
  patientId: string;
  doctors: Doctor[];
  prescription: PrescriptionWithDoctor;
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const deletePrescriptionAction = useAction(deletePrescription, {
    onSuccess: () => toast.success("Prescrição removida."),
    onError: () => toast.error("Erro ao remover prescrição."),
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
          <PrescriptionForm
            patientId={patientId}
            doctors={doctors}
            prescription={prescription}
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
            <AlertDialogTitle>Remover prescrição?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletePrescriptionAction.execute({
                  id: prescription.id,
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

export const PrescriptionsTab = ({
  patientId,
  prescriptions,
  doctors,
}: PrescriptionsTabProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Prescrições</CardTitle>
          <CardDescription>
            Medicamentos prescritos para o paciente.
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
            <PrescriptionForm
              patientId={patientId}
              doctors={doctors}
              onSuccess={() => setIsAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {prescriptions.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Nenhuma prescrição registrada.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Medicamento</TableHead>
                <TableHead>Posologia</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>{formatDate(prescription.date)}</TableCell>
                  <TableCell className="font-medium">
                    {prescription.medication}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {[
                      prescription.dosage,
                      prescription.frequency,
                      prescription.duration,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </TableCell>
                  <TableCell>{prescription.doctor?.name ?? "—"}</TableCell>
                  <TableCell>
                    <PrescriptionRowActions
                      patientId={patientId}
                      doctors={doctors}
                      prescription={prescription}
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
