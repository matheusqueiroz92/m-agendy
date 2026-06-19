"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { getProfessionalLabels } from "@/core/modules/clinics/domain/clinic-type";
import { authClient } from "@/lib/auth-client";

import { UpsertDoctorForm } from "./upsert-doctor-form";

export const AddDoctorButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const label = getProfessionalLabels(session?.user?.clinic?.type).singular;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar {label.toLowerCase()}
        </Button>
      </DialogTrigger>
      <UpsertDoctorForm onSuccess={() => setIsOpen(false)} />
    </Dialog>
  );
};
