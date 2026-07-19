export interface ProvisionClinicOwnerInput {
  name: string;
  email: string;
  phoneNumber?: string;
}

export interface ProvisionClinicOwnerOutput {
  userId: string;
  /** true quando uma conta nova foi criada (e o e-mail de definição de senha
   * foi enviado); false quando já existia um usuário com esse e-mail — nesse
   * caso ele só é reaproveitado, sem criar conta nem enviar e-mail. */
  createdNewAccount: boolean;
}

/**
 * Provisiona a conta do responsável por uma clínica criada pela plataforma
 * (fluxo do admin em `/platform/clinics`, diferente do autocadastro público).
 *
 * Reaproveita um usuário já existente com o mesmo e-mail (útil quando a
 * pessoa já usa o M.Agendy em outra clínica), ou cria uma conta nova e
 * dispara o e-mail de "definir senha" para o responsável acessar a clínica
 * pela primeira vez — sem que ninguém, nem o admin, veja/transmita uma senha.
 */
export interface ClinicOwnerProvisioner {
  provision(input: ProvisionClinicOwnerInput): Promise<ProvisionClinicOwnerOutput>;
}
