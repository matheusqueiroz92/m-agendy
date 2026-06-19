import { Authorizer } from "@/core/modules/iam/application/authorizer";

import { ViewClinicNotificationsUseCase } from "../../application/use-cases/view-clinic-notifications";
import { DrizzleNotificationReader } from "../persistence/drizzle-notification-reader";

export const makeViewClinicNotifications = () =>
  new ViewClinicNotificationsUseCase(
    new DrizzleNotificationReader(),
    new Authorizer(),
  );
