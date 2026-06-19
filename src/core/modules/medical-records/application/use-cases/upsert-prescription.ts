import { Authorizer } from "@/core/modules/iam/application/authorizer";
import { AuthenticatedActor } from "@/core/modules/iam/domain/authenticated-actor";
import { AuditLog } from "@/core/shared/application/ports/audit-log";
import { NotFoundError } from "@/core/shared/domain/errors";

import { Prescription } from "../../domain/prescription";
import { PatientAccessChecker } from "../ports/patient-access";
import { PrescriptionRepository } from "../ports/prescription-repository";

export interface UpsertPrescriptionInput {
  actor: AuthenticatedActor | null;
  clinicId: string;
  id?: string;
  patientId: string;
  doctorId?: string;
  attendanceId?: string;
  medication: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  date: Date;
}

export interface UpsertPrescriptionOutput {
  prescriptionId: string;
}

/**
 * Cria/atualiza uma prescrição. Exige membro da clínica, garante isolamento por
 * clínica e registra auditoria.
 */
export class UpsertPrescriptionUseCase {
  constructor(
    private readonly prescriptions: PrescriptionRepository,
    private readonly patientAccess: PatientAccessChecker,
    private readonly authorizer: Authorizer,
    private readonly audit: AuditLog,
  ) {}

  async execute(
    input: UpsertPrescriptionInput,
  ): Promise<UpsertPrescriptionOutput> {
    this.authorizer.assertCanAccessClinicalData(input.actor, input.clinicId);

    if (input.id) {
      const existing = await this.prescriptions.findById(input.id);
      if (!existing || existing.clinicId !== input.clinicId) {
        throw new NotFoundError("Prescrição não encontrada.");
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

    const prescription = Prescription.create({
      id: input.id,
      clinicId: input.clinicId,
      patientId: input.patientId,
      doctorId: input.doctorId,
      attendanceId: input.attendanceId,
      medication: input.medication,
      dosage: input.dosage,
      frequency: input.frequency,
      duration: input.duration,
      instructions: input.instructions,
      date: input.date,
    });

    await this.prescriptions.save(prescription);

    await this.audit.record({
      clinicId: input.clinicId,
      actorUserId: input.actor?.userId,
      action: input.id ? "prescription.updated" : "prescription.created",
      entityType: "prescription",
      entityId: prescription.id,
      metadata: { patientId: input.patientId },
    });

    return { prescriptionId: prescription.id };
  }
}
