/**
 * Porta de tempo. Abstrair "o agora" torna os casos de uso determinísticos e
 * testáveis (podemos injetar um relógio fixo nos testes) e remove a dependência
 * direta de `new Date()` dentro da regra de negócio.
 */
export interface Clock {
  now(): Date;
}
