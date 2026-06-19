import { SearchX } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataNotFound } from "@/components/ui/data-not-found";
import { PageSection } from "@/components/ui/page-section";

interface TopDoctorsProps {
  topDoctors: {
    id: string;
    name: string;
    avatarImageUrl: string | null;
    speciality: string;
    appointments: number;
  }[];
  professionalsLabel: string;
  professionalSingular: string;
}

export const TopDoctors = ({
  topDoctors,
  professionalsLabel,
  professionalSingular,
}: TopDoctorsProps) => {
  return (
    <PageSection title={`${professionalsLabel} em destaque`}>
      <div className="space-y-6">
        {topDoctors.length > 0 ? (
          topDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {doctor.avatarImageUrl ? (
                    <AvatarImage src={doctor.avatarImageUrl} />
                  ) : (
                    <AvatarFallback className="text-muted-foreground text-lg font-medium">
                      {doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div>
                  <h3 className="text-sm">{doctor.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {doctor.speciality}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground text-sm font-medium">
                  {doctor.appointments} consultas
                </span>
              </div>
            </div>
          ))
        ) : (
          <DataNotFound
            title={`Nenhum ${professionalSingular.toLowerCase()} cadastrado!`}
            description={`Ainda não há ${professionalsLabel.toLowerCase()} cadastrados. Adicione um ${professionalSingular.toLowerCase()} ao sistema.`}
            icon={<SearchX className="text-muted-foreground h-8 w-8" />}
          />
        )}
      </div>
    </PageSection>
  );
};
