import { describe, expect, it } from "vitest";

import { isConfirmationReply } from "./confirmation-reply";

describe("isConfirmationReply", () => {
  it("reconhece as palavras exatas originais", () => {
    expect(isConfirmationReply("confirmar")).toBe(true);
    expect(isConfirmationReply("confirmado")).toBe(true);
    expect(isConfirmationReply("sim")).toBe(true);
    expect(isConfirmationReply("ok")).toBe(true);
  });

  it("tolera variações de caixa, acento e pontuação", () => {
    expect(isConfirmationReply("CONFIRMADO")).toBe(true);
    expect(isConfirmationReply("Confirmado.")).toBe(true);
    expect(isConfirmationReply("OK!!")).toBe(true);
  });

  it("reconhece a confirmação mesmo com palavras extras na frase", () => {
    expect(isConfirmationReply("Sim, confirmo!")).toBe(true);
    expect(isConfirmationReply("ok, obrigado")).toBe(true);
    expect(isConfirmationReply("confirmado, até lá")).toBe(true);
  });

  it("não confirma quando há negação, mesmo com palavra de confirmação presente", () => {
    expect(isConfirmationReply("não vou confirmar")).toBe(false);
    expect(isConfirmationReply("não")).toBe(false);
    expect(isConfirmationReply("cancela por favor")).toBe(false);
  });

  it("rejeita texto vazio ou sem nenhuma palavra reconhecida", () => {
    expect(isConfirmationReply("")).toBe(false);
    expect(isConfirmationReply("   ")).toBe(false);
    expect(isConfirmationReply("blz")).toBe(false);
    expect(isConfirmationReply("obrigado")).toBe(false);
  });
});
