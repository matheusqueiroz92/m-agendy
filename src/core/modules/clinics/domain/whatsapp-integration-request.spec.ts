import { describe, expect, it } from "vitest";

import { ForbiddenError } from "@/core/shared/domain/errors";

import { ClinicValidationError } from "./errors";
import { WhatsAppIntegrationRequest } from "./whatsapp-integration-request";

describe("WhatsAppIntegrationRequest", () => {
  it("cria uma solicitação pendente, sem número ainda", () => {
    const request = WhatsAppIntegrationRequest.create({
      id: "req-1",
      clinicId: "clinic-1",
    });

    expect(request.status).toBe("pending");
    expect(request.isPending).toBe(true);
    expect(request.phoneNumberId).toBeNull();
    expect(request.completedAt).toBeNull();
  });

  it("conclui a solicitação gravando o phone_number_id", () => {
    const request = WhatsAppIntegrationRequest.create({
      id: "req-1",
      clinicId: "clinic-1",
    });

    const completed = request.complete("123456789");

    expect(completed.status).toBe("completed");
    expect(completed.isPending).toBe(false);
    expect(completed.phoneNumberId).toBe("123456789");
    expect(completed.completedAt).toBeInstanceOf(Date);
  });

  it("recusa concluir sem um phone_number_id", () => {
    const request = WhatsAppIntegrationRequest.create({
      id: "req-1",
      clinicId: "clinic-1",
    });

    expect(() => request.complete("")).toThrow(ClinicValidationError);
    expect(() => request.complete("   ")).toThrow(ClinicValidationError);
  });

  it("recusa concluir uma solicitação já concluída", () => {
    const request = WhatsAppIntegrationRequest.create({
      id: "req-1",
      clinicId: "clinic-1",
    }).complete("123456789");

    expect(() => request.complete("987654321")).toThrow(ForbiddenError);
  });

  it("reidrata uma solicitação já persistida sem revalidar", () => {
    const restored = WhatsAppIntegrationRequest.restore({
      id: "req-2",
      clinicId: "clinic-2",
      status: "completed",
      phoneNumberId: "555",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      completedAt: new Date("2026-01-02T00:00:00Z"),
    });

    expect(restored.status).toBe("completed");
    expect(restored.phoneNumberId).toBe("555");
    expect(restored.toPrimitives()).toEqual({
      id: "req-2",
      clinicId: "clinic-2",
      status: "completed",
      phoneNumberId: "555",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      completedAt: new Date("2026-01-02T00:00:00Z"),
    });
  });
});
