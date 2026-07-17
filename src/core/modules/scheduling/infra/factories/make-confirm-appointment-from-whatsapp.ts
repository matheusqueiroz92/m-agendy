import { SystemClock } from "@/core/shared/infra/system-clock";

import { ConfirmAppointmentFromWhatsAppUseCase } from "../../application/use-cases/confirm-appointment-from-whatsapp";
import { DrizzleClinicNotifier } from "../messaging/drizzle-clinic-notifier";
import { HttpWhatsAppMessenger } from "../messaging/whatsapp-messenger";
import { DrizzleAppointmentRepository } from "../persistence/drizzle-appointment-repository";
import { DrizzleConfirmationLookup } from "../persistence/drizzle-confirmation-lookup";

/** Composition root da confirmação de consulta via WhatsApp. */
export const makeConfirmAppointmentFromWhatsApp = () =>
  new ConfirmAppointmentFromWhatsAppUseCase(
    new DrizzleConfirmationLookup(),
    new DrizzleAppointmentRepository(),
    new DrizzleClinicNotifier(),
    new SystemClock(),
    new HttpWhatsAppMessenger({
      apiUrl: process.env.WHATSAPP_API_URL,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    }),
  );
