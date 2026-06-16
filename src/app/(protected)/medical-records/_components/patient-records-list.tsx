"use client";

import { motion } from "framer-motion";
import { FileText, MailIcon, PhoneIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { patientsTable } from "@/db/schema";

interface PatientRecordsListProps {
  patients: (typeof patientsTable.$inferSelect)[];
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

const formatPhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

export const PatientRecordsList = ({ patients }: PatientRecordsListProps) => {
  const [search, setSearch] = useState("");

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(term) ||
        patient.email.toLowerCase().includes(term),
    );
  }, [patients, search]);

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <SearchIcon className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar paciente por nome ou e-mail..."
          className="pl-9"
        />
      </div>

      {filteredPatients.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nenhum paciente encontrado para “{search}”.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient, index) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.3) }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {getInitials(patient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium">
                        {patient.name}
                      </h3>
                      <p className="text-muted-foreground truncate text-sm">
                        {patient.sex === "male" ? "Masculino" : "Feminino"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="flex flex-col gap-2">
                  <Badge variant="outline" className="max-w-full">
                    <MailIcon className="mr-1 h-3 w-3 shrink-0" />
                    <span className="truncate">{patient.email}</span>
                  </Badge>
                  <Badge variant="outline">
                    <PhoneIcon className="mr-1 h-3 w-3 shrink-0" />
                    {formatPhoneNumber(patient.phoneNumber)}
                  </Badge>
                </CardContent>
                <Separator />
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/medical-records/${patient.id}`}>
                      <FileText className="mr-1 h-4 w-4" />
                      Ver prontuário
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
