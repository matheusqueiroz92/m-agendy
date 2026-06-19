import { FollowUp } from "../../domain/follow-up";

/** Porta de persistência de acompanhamentos. */
export interface FollowUpRepository {
  findById(id: string): Promise<FollowUp | null>;
  save(followUp: FollowUp): Promise<void>;
  delete(id: string): Promise<void>;
}
