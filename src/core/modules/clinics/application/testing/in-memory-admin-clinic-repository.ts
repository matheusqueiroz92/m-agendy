import { ClinicType } from "../../domain/clinic-type";
import { ClinicStatus } from "../../domain/clinic-access";
import {
  AdminClinicListItem,
  AdminClinicRepository,
} from "../ports/admin-clinic-repository";

type Row = AdminClinicListItem;

/** AdminClinicRepository em memória para testes. */
export class InMemoryAdminClinicRepository implements AdminClinicRepository {
  public items: Row[] = [];
  private seq = 0;

  async listAll(): Promise<Row[]> {
    return [...this.items];
  }

  async exists(id: string): Promise<boolean> {
    return this.items.some((c) => c.id === id);
  }

  async create(data: { name: string; type: ClinicType }): Promise<{ id: string }> {
    const id = `clinic-${++this.seq}`;
    this.items.push({
      id,
      name: data.name,
      type: data.type,
      status: "active",
      blockedReason: null,
      planOverride: null,
      planOverrideExpiresAt: null,
      basePlan: null,
      ownerName: null,
      ownerEmail: null,
      createdAt: new Date(),
      patientsCount: 0,
      doctorsCount: 0,
      appointmentsCount: 0,
      membersCount: 0,
    });
    return { id };
  }

  async update(id: string, data: { name: string; type: ClinicType }): Promise<void> {
    const c = this.items.find((x) => x.id === id);
    if (c) {
      c.name = data.name;
      c.type = data.type;
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((c) => c.id !== id);
  }

  async setStatus(
    id: string,
    status: ClinicStatus,
    reason: string | null,
  ): Promise<void> {
    const c = this.items.find((x) => x.id === id);
    if (c) {
      c.status = status;
      c.blockedReason = reason;
    }
  }

  async setPlanOverride(
    id: string,
    planOverride: string | null,
    expiresAt: Date | null,
  ): Promise<void> {
    const c = this.items.find((x) => x.id === id);
    if (c) {
      c.planOverride = planOverride;
      c.planOverrideExpiresAt = expiresAt;
    }
  }
}
