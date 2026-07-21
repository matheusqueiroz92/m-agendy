import { describe, expect, it } from "vitest";

import { toE164BR } from "./phone-number";

describe("toE164BR", () => {
  it("adiciona o DDI 55 a um celular sem código do país (com máscara)", () => {
    expect(toE164BR("(11) 99999-9999")).toBe("5511999999999");
  });

  it("adiciona o DDI 55 a um celular sem código do país (só dígitos)", () => {
    expect(toE164BR("11999999999")).toBe("5511999999999");
  });

  it("adiciona o DDI 55 a um fixo sem código do país (10 dígitos)", () => {
    expect(toE164BR("(11) 9999-9999")).toBe("551199999999");
  });

  it("mantém como está um número que já vem com o DDI 55 (com máscara/símbolo +)", () => {
    expect(toE164BR("+55 11 99999-9999")).toBe("5511999999999");
  });

  it("mantém como está um número que já vem com o DDI 55 (só dígitos)", () => {
    expect(toE164BR("5511999999999")).toBe("5511999999999");
  });

  it("não duplica o DDI ao normalizar um valor já normalizado", () => {
    expect(toE164BR(toE164BR("(11) 99999-9999"))).toBe("5511999999999");
  });
});
