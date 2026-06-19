import { Authorizer } from "@/core/modules/iam/application/authorizer";

import { CountUnreadNotificationsUseCase } from "../../application/use-cases/count-unread-notifications";
import { DrizzleNotificationReader } from "../persistence/drizzle-notification-reader";

export const makeCountUnreadNotifications = () =>
  new CountUnreadNotificationsUseCase(
    new DrizzleNotificationReader(),
    new Authorizer(),
  );
