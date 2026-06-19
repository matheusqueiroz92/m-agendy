import { and, eq } from "drizzle-orm";

import { resolveClinicAccess } from "@/core/modules/clinics/domain/clinic-access";
import { db } from "@/db";
import { clinicsTable, usersToClinicsTable } from "@/db/schema";

import { ClinicPlanProvider } from "../../application/ports/clinic-plan-provider";

/**
 * Resolve o plano efetivo de uma clínica para os fluxos sem sessão.
 * Combina status + override da clínica com o plano "de base" do dono, usando a
 * mesma regra de domínio da sessão (resolveClinicAccess).
 */
export class DrizzleClinicPlanProvider implements ClinicPlanProvider {
  async getEffectivePlan(clinicId: string): Promise<string | null> {
    const clinic = await db.query.clinicsTable.findFirst({
      where: eq(clinicsTable.id, clinicId),
      columns: {
        status: true,
        planOverride: true,
        planOverrideExpiresAt: true,
      },
    });
    if (!clinic) return null;

    const owner = await db.query.usersToClinicsTable.findFirst({
      where: and(
        eq(usersToClinicsTable.clinicId, clinicId),
        eq(usersToClinicsTable.role, "owner"),
      ),
      with: { user: true },
    });

    return resolveClinicAccess({
      status: clinic.status,
      planOverride: clinic.planOverride ?? null,
      planOverrideExpiresAt: clinic.planOverrideExpiresAt ?? null,
      basePlan: owner?.user?.plan ?? null,
      now: new Date(),
    }).effectivePlan;
  }
}
