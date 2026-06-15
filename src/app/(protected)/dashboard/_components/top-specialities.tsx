import {
  Activity,
  Baby,
  Bone,
  Brain,
  Eye,
  Hand,
  Heart,
  SearchX,
  Stethoscope,
} from "lucide-react";

import { DataNotFound } from "@/components/ui/data-not-found";
import { PageSection } from "@/components/ui/page-section";
import { Progress } from "@/components/ui/progress";

interface TopSpecialitiesProps {
  topSpecialities: {
    speciality: string;
    appointments: number;
  }[];
}

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

export const TopSpecialities = ({ topSpecialities }: TopSpecialitiesProps) => {
  const maxAppointments = Math.max(
    ...topSpecialities.map((i) => i.appointments),
  );
  return (
    <PageSection title="Especialidades em destaque">
      <div className="space-y-6">
        {topSpecialities.length > 0 ? (
          topSpecialities.map((speciality) => {
            const Icon = getSpecialityIcon(speciality.speciality);
            const progressValue =
              (speciality.appointments / maxAppointments) * 100;

            return (
              <div
                key={speciality.speciality}
                className="flex items-center gap-2"
              >
                <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-full">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex w-full flex-col justify-center">
                  <div className="flex w-full justify-between">
                    <h3 className="text-sm">{speciality.speciality}</h3>
                    <div className="text-right">
                      <span className="text-muted-foreground text-sm font-medium">
                        {speciality.appointments} consultas
                      </span>
                    </div>
                  </div>
                  <Progress value={progressValue} className="w-full" />
                </div>
              </div>
            );
          })
        ) : (
          <DataNotFound
            title="Nenhuma especialidade cadastrada!"
            description="Ainda não há especialidades cadastrados. Adicione uma especialidade ao sistema."
            icon={<SearchX className="text-muted-foreground h-8 w-8" />}
          />
        )}
      </div>
    </PageSection>
  );
};
