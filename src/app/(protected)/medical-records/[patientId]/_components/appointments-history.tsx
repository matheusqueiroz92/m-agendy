"use client";

import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrencyInCents } from "@/helpers/currency";

import { formatDateTime } from "./labels";
import { AppointmentWithDoctor } from "./types";

interface AppointmentsHistoryProps {
  appointments: AppointmentWithDoctor[];
}

export const AppointmentsHistory = ({
  appointments,
}: AppointmentsHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de consultas</CardTitle>
        <CardDescription>
          Todas as consultas agendadas para este paciente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-2 py-8 text-sm">
            <CalendarDays className="h-8 w-8" />
            Nenhuma consulta registrada.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => {
                const isPast = new Date(appointment.date) < new Date();
                return (
                  <TableRow key={appointment.id}>
                    <TableCell>{formatDateTime(appointment.date)}</TableCell>
                    <TableCell>{appointment.doctor.name}</TableCell>
                    <TableCell>{appointment.doctor.speciality}</TableCell>
                    <TableCell>
                      {formatCurrencyInCents(
                        appointment.appointmentPriceInCents,
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isPast ? "secondary" : "outline"}>
                        {isPast ? "Realizada" : "Agendada"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
