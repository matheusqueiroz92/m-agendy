import { FollowUp } from "../../domain/follow-up";
import { FollowUpRepository } from "../ports/follow-up-repository";

/** Repositório de acompanhamentos em memória, para uso em testes. */
export class InMemoryFollowUpRepository implements FollowUpRepository {
  public items: FollowUp[] = [];

  async findById(id: string): Promise<FollowUp | null> {
    return this.items.find((f) => f.id === id) ?? null;
  }

  async save(followUp: FollowUp): Promise<void> {
    const index = this.items.findIndex((f) => f.id === followUp.id);
    if (index >= 0) {
      this.items[index] = followUp;
    } else {
      this.items.push(followUp);
    }
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((f) => f.id !== id);
  }
}
