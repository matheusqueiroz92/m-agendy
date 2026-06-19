import { Clock } from "@/core/shared/application/ports/clock";

/**
 * Implementação concreta da porta Clock usando o relógio do sistema.
 * É um adapter de infraestrutura: pode ser trocado sem afetar o domínio.
 */
export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
