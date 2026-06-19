export interface PortalPatient {
  id: string;
  name: string;
  clinicId: string;
}

/**
 * Resolve o paciente associado a uma conta de usuário no portal. Implementa o
 * auto-vínculo: se a conta ainda não está ligada a um paciente, tenta casar
 * pelo e-mail com um registro de paciente sem vínculo.
 */
export interface PortalPatientDirectory {
  findByUserId(userId: string): Promise<PortalPatient | null>;
  /**
   * Vincula a conta a um paciente com o mesmo e-mail e sem userId ainda.
   * Retorna o paciente vinculado, ou null se não houver correspondência.
   */
  linkByEmail(params: {
    userId: string;
    email: string;
  }): Promise<PortalPatient | null>;
}
