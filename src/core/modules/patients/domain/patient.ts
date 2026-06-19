import { PatientValidationError } from "./errors";

export type PatientSex = "male" | "female";

export interface PatientProps {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  phoneNumber: string;
  sex: PatientSex;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Entidade de domínio Patient. Concentra as invariantes do paciente,
 * independente de Drizzle/Next. A validação de formato também acontece na borda
 * (Zod), mas o domínio é a fonte de verdade das regras.
 */
export class Patient {
  private constructor(private readonly props: PatientProps) {}

  static create(input: Omit<PatientProps, "id"> & { id?: string }): Patient {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const phoneNumber = input.phoneNumber.trim();

    if (!name) {
      throw new PatientValidationError("O nome do paciente é obrigatório.");
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new PatientValidationError("E-mail inválido.");
    }
    if (!phoneNumber) {
      throw new PatientValidationError("O telefone é obrigatório.");
    }

    return new Patient({
      id: input.id ?? crypto.randomUUID(),
      clinicId: input.clinicId,
      name,
      email,
      phoneNumber,
      sex: input.sex,
    });
  }

  static restore(props: PatientProps): Patient {
    return new Patient(props);
  }

  get id(): string {
    return this.props.id;
  }

  get clinicId(): string {
    return this.props.clinicId;
  }

  toPrimitives(): PatientProps {
    return { ...this.props };
  }
}
