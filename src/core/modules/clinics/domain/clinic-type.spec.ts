import { describe, expect, it } from "vitest";

import {
  CLINIC_TYPES,
  clinicTypeConfig,
  getClinicTypeConfig,
  getProfessionalLabels,
} from "./clinic-type";

describe("clinic-type config", () => {
  it("tem configuração para todos os tipos", () => {
    for (const type of CLINIC_TYPES) {
      expect(clinicTypeConfig[type]).toBeDefined();
      expect(clinicTypeConfig[type].professionalPlural).toBeTruthy();
    }
  });

  it("retorna rótulos por tipo", () => {
    expect(getProfessionalLabels("medical").plural).toBe("Médicos");
    expect(getProfessionalLabels("dental").singular).toBe("Dentista");
    expect(getProfessionalLabels("physiotherapy").plural).toBe(
      "Fisioterapeutas",
    );
  });

  it("usa fallback seguro para tipo inválido ou nulo", () => {
    expect(getProfessionalLabels(null).plural).toBe("Profissionais");
    expect(getProfessionalLabels("inexistente").plural).toBe("Profissionais");
    expect(getClinicTypeConfig(undefined).professionalSingular).toBe(
      "Profissional",
    );
  });
});
