import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { Stethoscope } from "lucide-react";

import { AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface TopDoctorsListProps {
  topDoctors: Doctor[];
}

interface Doctor {
  id: string;
  name: string;
  avatarImageUrl: string | null;
  speciality: string;
  appointments: number;
}

const TopDoctors = ({ topDoctors }: TopDoctorsListProps) => {
  return (
    <Card className="mx-auto w-full">
      <CardContent>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-muted-foreground" />
            <CardTitle className="text-base">Top Médicos</CardTitle>
          </div>
        </div>

        {/* Doctors List */}
        <div className="space-y-6">
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

export default TopDoctors;
