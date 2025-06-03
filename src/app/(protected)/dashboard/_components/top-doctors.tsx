import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Star } from "lucide-react";

import { AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface TopDoctorsProps {
  topDoctors: {
    id: string;
    name: string;
    avatarImageUrl: string | null;
    speciality: string;
    appointments: number;
  }[];
}

export const TopDoctors = ({ topDoctors }: TopDoctorsProps) => {
  return (
    <Card className="mx-auto w-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <Star className="text-[var(--primary)]" />
        <CardTitle>Top Médicos</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent>
        <div className="space-y-10">
          {topDoctors.map((doctor) => (
            <div key={doctor.id} className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <Avatar className="h-10 w-10">
                  {doctor.avatarImageUrl ? (
                    <AvatarImage src={doctor.avatarImageUrl} />
                  ) : (
                    <AvatarFallback className="rounded-full bg-gray-100 p-4 text-lg font-medium text-gray-600">
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
                  {doctor.appointments} agend.
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
