import { SystemClock } from "@/core/shared/infra/system-clock";

import { ConfirmAppointmentFromWhatsAppUseCase } from "../../application/use-cases/confirm-appointment-from-whatsapp";
import { DrizzleClinicNotifier } from "../messaging/drizzle-clinic-notifier";
import { DrizzleConfirmationLookup } from "../persistence/drizzle-confirmation-lookup";
import { DrizzleAppointmentRepository } from "../persistence/drizzle-appointment-repository";

/** Composition root da confirmação de consulta via WhatsApp. */
export const makeConfirmAppointmentFromWhatsApp = () =>
  new ConfirmAppointmentFromWhatsAppUseCase(
    new DrizzleConfirmationLookup(),
    new DrizzleAppointmentRepository(),
    new DrizzleClinicNotifier(),
    new SystemClock(),
  );
