/**
 * Porta de verificação de pertencimento do paciente à clínica. Usada por todos
 * os casos de uso do prontuário para garantir o isolamento por clínica
 * (multi-tenant) antes de ler/gravar dados sensíveis.
 */
export interface PatientAccessChecker {
  belongsToClinic(params: {
    patientId: string;
    clinicId: string;
  }): Promise<boolean>;
}
