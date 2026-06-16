"use client";

import { PencilIcon } from "lucide-react";
import { useState } from "react";

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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { AntecedentsForm } from "./antecedents-form";
import { MedicalRecord } from "./types";

interface AntecedentsTabProps {
  patientId: string;
  medicalRecord: MedicalRecord | null;
}

const fields: { label: string; key: keyof MedicalRecord }[] = [
  { label: "Tipo sanguíneo", key: "bloodType" },
  { label: "Alergias", key: "allergies" },
  { label: "Medicamentos em uso", key: "medicationsInUse" },
  { label: "Antecedentes clínicos", key: "clinicalHistory" },
  { label: "Antecedentes cirúrgicos", key: "surgicalHistory" },
  { label: "Antecedentes familiares", key: "familyHistory" },
  { label: "Hábitos", key: "habits" },
  { label: "Observações gerais", key: "notes" },
];

export const AntecedentsTab = ({
  patientId,
  medicalRecord,
}: AntecedentsTabProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Antecedentes e informações de saúde</CardTitle>
          <CardDescription>
            Alergias, medicamentos em uso, antecedentes clínicos, cirúrgicos,
            familiares e hábitos.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <PencilIcon className="mr-1 h-4 w-4" />
              Editar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar antecedentes</DialogTitle>
              <DialogDescription>
                Atualize as informações de saúde do paciente.
              </DialogDescription>
            </DialogHeader>
            <AntecedentsForm
              patientId={patientId}
              medicalRecord={medicalRecord}
              onSuccess={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((item) => {
          const value = medicalRecord?.[item.key] as string | null | undefined;
          return (
            <div key={item.key} className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                {item.label}
              </p>
              <p className="text-sm whitespace-pre-wrap">
                {value && value.trim().length > 0 ? (
                  value
                ) : (
                  <span className="text-muted-foreground">Não informado</span>
                )}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
