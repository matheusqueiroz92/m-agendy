import {
  ClinicOwnerProvisioner,
  ProvisionClinicOwnerInput,
  ProvisionClinicOwnerOutput,
} from "../ports/clinic-owner-provisioner";

/** ClinicOwnerProvisioner fake, para uso em testes. */
export class FakeClinicOwnerProvisioner implements ClinicOwnerProvisioner {
  public readonly provisioned: ProvisionClinicOwnerInput[] = [];
  private readonly existingByEmail = new Map<string, string>();
  private nextId = 0;
  private shouldFail = false;

  /** Simula um e-mail que já pertence a um usuário existente. */
  setExisting(email: string, userId: string): void {
    this.existingByEmail.set(email, userId);
  }

  /** Faz a próxima chamada a `provision` lançar um erro (simula falha). */
  failNext(): void {
    this.shouldFail = true;
  }

  async provision(
    input: ProvisionClinicOwnerInput,
  ): Promise<ProvisionClinicOwnerOutput> {
    if (this.shouldFail) {
      this.shouldFail = false;
      throw new Error("Falha simulada ao provisionar responsável.");
    }

    this.provisioned.push(input);

    const existingUserId = this.existingByEmail.get(input.email);
    if (existingUserId) {
      return { userId: existingUserId, createdNewAccount: false };
    }

    return { userId: `user-${++this.nextId}`, createdNewAccount: true };
  }
}
