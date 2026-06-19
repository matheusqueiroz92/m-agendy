import { SystemClock } from "@/core/shared/infra/system-clock";

import { GetPatientPortalAgendaUseCase } from "../../application/use-cases/get-patient-portal-agenda";
import { DrizzlePatientAppointmentsReader } from "../persistence/drizzle-patient-appointments-reader";
import { DrizzlePortalPatientDirectory } from "../persistence/drizzle-portal-patient-directory";

/** Composition root da agenda do portal do paciente. */
export const makeGetPatientPortalAgenda = () =>
  new GetPatientPortalAgendaUseCase(
    new DrizzlePortalPatientDirectory(),
    new DrizzlePatientAppointmentsReader(),
    new SystemClock(),
  );
