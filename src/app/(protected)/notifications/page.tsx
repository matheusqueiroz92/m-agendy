import dayjs from "dayjs";
import { BellOff } from "lucide-react";
import { redirect } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { DataNotFound } from "@/components/ui/data-not-found";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { resolveCurrentClinicId } from "@/core/modules/iam/infra/current-clinic";
import { getAuthenticatedActor } from "@/core/modules/iam/infra/session-actor-provider";
import { makeViewClinicNotifications } from "@/core/modules/notifications/infra/factories/make-view-clinic-notifications";

const NotificationsPage = async () => {
  const actor = await getAuthenticatedActor();
  if (!actor) {
    redirect("/auth");
  }

  const clinicId = resolveCurrentClinicId(actor);
  const notifications = await makeViewClinicNotifications().execute({
    actor,
    clinicId,
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Notificações</PageTitle>
          <PageDescription>
            Avisos da clínica, como confirmações de consultas pelos pacientes.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        {notifications.length === 0 ? (
          <DataNotFound
            title="Nenhuma notificação"
            description="As confirmações e avisos da clínica aparecerão aqui."
            icon={<BellOff className="text-muted-foreground h-8 w-8" />}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start justify-between gap-3 border-b py-3 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm">{notification.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {dayjs(notification.createdAt).format(
                        "DD/MM/YYYY [às] HH:mm",
                      )}
                    </p>
                  </div>
                  {notification.readAt === null && (
                    <span className="bg-primary mt-1 h-2 w-2 shrink-0 rounded-full" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </PageContent>
    </PageContainer>
  );
};

export default NotificationsPage;
