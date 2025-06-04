import {
  Activity,
  Baby,
  Bone,
  Brain,
  Eye,
  Hand,
  Heart,
  Hospital,
  Stethoscope,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface TopSpecialitiesProps {
  topSpecialities: {
    speciality: string;
    appointments: number;
  }[];
}

// ALTERAR ESSE COMPONENTE COM A LISTAGEM DE ESPECIALIDADES

const getSpecialityIcon = (speciality: string) => {
  const specialityLower = speciality.toLowerCase();

  if (specialityLower.includes("cardiolog")) return Heart;
  if (
    specialityLower.includes("ginecolog") ||
    specialityLower.includes("obstetri")
  )
    return Baby;
  if (specialityLower.includes("pediatr")) return Activity;
  if (specialityLower.includes("dermatolog")) return Hand;
  if (
    specialityLower.includes("ortoped") ||
    specialityLower.includes("traumatolog")
  )
    return Bone;
  if (specialityLower.includes("oftalmolog")) return Eye;
  if (specialityLower.includes("neurolog")) return Brain;

  return Stethoscope;
};

// const specialitiesAndIcons = [
//   {
//     speciality: "Cardiologista",
//     icon: Heart,
//   },
//   {
//     speciality: "Ginecologista",
//     icon: Baby,
//   },
//   {
//     speciality: "Pediatra",
//     icon: Activity,
//   },
//   {
//     speciality: "Dermatologista",
//     icon: Hand,
//   },
//   {
//     speciality: "Ortopedista",
//     icon: Bone,
//   },
//   {
//     speciality: "Oftalmologista",
//     icon: Eye,
//   },
//   {
//     speciality: "Neurologista",
//     icon: Brain,
//   },
//   {
//     speciality: "Traumatologista",
//     icon: Bone,
//   },
//   {
//     speciality: "Urologista",
//     icon: Urology,
//   },
// ];

export const TopSpecialities = ({ topSpecialities }: TopSpecialitiesProps) => {
  const maxAppointments = Math.max(
    ...topSpecialities.map((i) => i.appointments),
  );
  return (
    <Card className="mx-auto w-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <Hospital className="text-[var(--primary)]" />
        <CardTitle>Top Especialidades</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        <div className="space-y-6">
          {topSpecialities.map((speciality) => {
            const Icon = getSpecialityIcon(speciality.speciality);
            // Porcentagem de ocupação da especialidade baseando-se no maior número de agendamentos
            const progressValue =
              (speciality.appointments / maxAppointments) * 100;

            return (
              <div
                key={speciality.speciality}
                className="flex items-center gap-2"
              >
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <Icon className="text-primary h-5 w-5" />
                </div>
                <div className="flex w-full flex-col justify-center">
                  <div className="flex w-full justify-between">
                    <h3 className="text-sm">{speciality.speciality}</h3>
                    <div className="text-right">
                      <span className="text-muted-foreground text-sm font-medium">
                        {speciality.appointments} agend.
                      </span>
                    </div>
                  </div>
                  <Progress value={progressValue} className="w-full" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
