import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { ClinicalAttendance } from "../../domain/clinical-attendance";
import { ClinicalAttendanceRepository } from "../ports/clinical-attendance-repository";
import { PatientAccessChecker } from "../ports/patient-access";

export interface UpsertClinicalAttendanceInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  id?: string;
  patientId: string;
  doctorId?: string;
  appointmentId?: string;
  date: Date;
  chiefComplaint?: string;
  historyOfPresentIllness?: string;
  physicalExam?: string;
  conduct?: string;
  notes?: string;
}

export interface UpsertClinicalAttendanceOutput {
  attendanceId: string;
}

/**
 * Cria/atualiza um atendimento clínico. Exige membro da clínica, garante
 * isolamento por clínica e registra auditoria (dado clínico sensível).
 */
export class UpsertClinicalAttendanceUseCase {
  constructor(
    private readonly attendances: ClinicalAttendanceRepository,
    private readonly patientAccess: PatientAccessChecker,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(
    input: UpsertClinicalAttendanceInput,
  ): Promise<UpsertClinicalAttendanceOutput> {
    this.authorizer.assertCanAccessClinicalData(input.actor, input.clinicId);

    if (input.id) {
      const existing = await this.attendances.findById(input.id);
      if (!existing || existing.clinicId !== input.clinicId) {
        throw new NotFoundError("Atendimento não encontrado.");
      }
    } else {
      const belongs = await this.patientAccess.belongsToClinic({
        patientId: input.patientId,
        clinicId: input.clinicId,
      });
      if (!belongs) {
        throw new NotFoundError("Paciente não encontrado.");
      }
    }

    const attendance = ClinicalAttendance.create({
      id: input.id,
      clinicId: input.clinicId,
      patientId: input.patientId,
      doctorId: input.doctorId,
      appointmentId: input.appointmentId,
      date: input.date,
      chiefComplaint: input.chiefComplaint,
      historyOfPresentIllness: input.historyOfPresentIllness,
      physicalExam: input.physicalExam,
      conduct: input.conduct,
      notes: input.notes,
    });

    await this.attendances.save(attendance);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: input.id ? "attendance.updated" : "attendance.created",
      entityType: "attendance",
      entityId: attendance.id,
      metadata: { patientId: input.patientId },
    });

    return { attendanceId: attendance.id };
  }
}
