export const CLINIC_TYPES = [
  "medical",
  "dental",
  "physiotherapy",
  "nutrition",
  "psychology",
  "multidisciplinary",
] as const;

export type ClinicType = (typeof CLINIC_TYPES)[number];

export interface ClinicTypeConfig {
  /** Rótulo do tipo de clínica (ex.: "Clínica médica"). */
  clinicLabel: string;
  /** Como chamar UM profissional (ex.: "Médico", "Dentista"). */
  professionalSingular: string;
  /** Como chamar VÁRIOS profissionais (ex.: "Médicos"). */
  professionalPlural: string;
  /** Sugestões de especialidade para o tipo (editável pelo usuário). */
  specialties: string[];
}

export const clinicTypeConfig: Record<ClinicType, ClinicTypeConfig> = {
  medical: {
    clinicLabel: "Clínica médica",
    professionalSingular: "Médico",
    professionalPlural: "Médicos",
    specialties: [
      "Clínica Médica",
      "Cardiologia",
      "Dermatologia",
      "Endocrinologia",
      "Gastroenterologia",
      "Ginecologia e Obstetrícia",
      "Neurologia",
      "Ortopedia e Traumatologia",
      "Pediatria",
      "Psiquiatria",
      "Urologia",
    ],
  },
  dental: {
    clinicLabel: "Clínica odontológica",
    professionalSingular: "Dentista",
    professionalPlural: "Dentistas",
    specialties: [
      "Clínica Geral (Odontologia)",
      "Ortodontia",
      "Endodontia",
      "Implantodontia",
      "Periodontia",
      "Odontopediatria",
      "Prótese Dentária",
      "Cirurgia Bucomaxilofacial",
      "Dentística",
    ],
  },
  physiotherapy: {
    clinicLabel: "Clínica de fisioterapia",
    professionalSingular: "Fisioterapeuta",
    professionalPlural: "Fisioterapeutas",
    specialties: [
      "Fisioterapia Ortopédica",
      "Fisioterapia Neurológica",
      "Fisioterapia Respiratória",
      "Fisioterapia Esportiva",
      "Fisioterapia Pélvica",
      "RPG",
      "Pilates Clínico",
    ],
  },
  nutrition: {
    clinicLabel: "Clínica de nutrição",
    professionalSingular: "Nutricionista",
    professionalPlural: "Nutricionistas",
    specialties: [
      "Nutrição Clínica",
      "Nutrição Esportiva",
      "Nutrição Materno-infantil",
      "Nutrição Comportamental",
      "Nutrição Funcional",
    ],
  },
  psychology: {
    clinicLabel: "Clínica de psicologia",
    professionalSingular: "Psicólogo",
    professionalPlural: "Psicólogos",
    specialties: [
      "Psicologia Clínica",
      "Terapia Cognitivo-Comportamental",
      "Psicanálise",
      "Psicologia Infantil",
      "Neuropsicologia",
      "Terapia de Casal e Família",
    ],
  },
  multidisciplinary: {
    clinicLabel: "Clínica multidisciplinar",
    professionalSingular: "Profissional",
    professionalPlural: "Profissionais",
    specialties: [],
  },
};

const FALLBACK: ClinicType = "multidisciplinary";

/** Resolve a configuração de um tipo de clínica, com fallback seguro. */
export const getClinicTypeConfig = (
  type: string | null | undefined,
): ClinicTypeConfig =>
  clinicTypeConfig[(type as ClinicType) ?? FALLBACK] ??
  clinicTypeConfig[FALLBACK];

/** Atalho para os rótulos de profissional de um tipo de clínica. */
export const getProfessionalLabels = (type: string | null | undefined) => {
  const config = getClinicTypeConfig(type);
  return {
    singular: config.professionalSingular,
    plural: config.professionalPlural,
  };
};
