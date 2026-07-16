import { createHmac } from "node:crypto";

import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { db } from "@/db";
import { appointmentsTable } from "@/db/schema";
import { resetTestDatabase } from "@/core/shared/infra/testing/reset-test-database";
import {
  seedClinicWithOwnerAndDoctor,
  seedPatient,
} from "@/core/shared/infra/testing/seed-test-data";
import { Appointment } from "@/core/modules/scheduling/domain/appointment";
import { DrizzleAppointmentRepository } from "@/core/modules/scheduling/infra/persistence/drizzle-appointment-repository";

import { GET, POST } from "./route";

const APP_SECRET = "test-whatsapp-app-secret";
const WEBHOOK_URL = "http://localhost/api/whatsapp/webhook";

const sign = (body: string) =>
  "sha256=" + createHmac("sha256", APP_SECRET).update(body, "utf8").digest("hex");

const buildIncomingMessagePayload = (params: { from: string; text: string }) => ({
  entry: [
    {
      changes: [
        {
          value: {
            metadata: { phone_number_id: "1234567890" },
            messages: [{ from: params.from, type: "text", text: { body: params.text } }],
          },
        },
      ],
    },
  ],
});

/**
 * Testes de integração da rota do webhook do WhatsApp — o foco é a fronteira
 * de segurança pública (assinatura `X-Hub-Signature-256`) e o fluxo real de
 * confirmação de consulta, batendo no banco de teste de verdade.
 */
describe("POST/GET /api/whatsapp/webhook (integração)", () => {
  const originalAppSecret = process.env.WHATSAPP_APP_SECRET;
  const originalVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  beforeEach(async () => {
    await resetTestDatabase();
    process.env.WHATSAPP_APP_SECRET = APP_SECRET;
    process.env.WHATSAPP_VERIFY_TOKEN = "verify-token-de-teste";
  });

  afterEach(() => {
    process.env.WHATSAPP_APP_SECRET = originalAppSecret;
    process.env.WHATSAPP_VERIFY_TOKEN = originalVerifyToken;
  });

  describe("GET (handshake de verificação)", () => {
    it("responde com o challenge quando o token confere", async () => {
      const url = `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=verify-token-de-teste&hub.challenge=abc123`;
      const res = await GET(new NextRequest(url));

      expect(res.status).toBe(200);
      expect(await res.text()).toBe("abc123");
    });

    it("rejeita com 403 quando o token não confere", async () => {
      const url = `${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=token-errado&hub.challenge=abc123`;
      const res = await GET(new NextRequest(url));

      expect(res.status).toBe(403);
    });
  });

  describe("POST (mensagens recebidas)", () => {
    it("rejeita com 401 quando a assinatura é inválida", async () => {
      const body = JSON.stringify(
        buildIncomingMessagePayload({ from: "5511999999999", text: "sim" }),
      );

      const res = await POST(
        new NextRequest(WEBHOOK_URL, {
          method: "POST",
          body,
          headers: { "x-hub-signature-256": "sha256=" + "0".repeat(64) },
        }),
      );

      expect(res.status).toBe(401);
    });

    it("rejeita com 401 quando o header de assinatura está ausente", async () => {
      const body = JSON.stringify(
        buildIncomingMessagePayload({ from: "5511999999999", text: "sim" }),
      );

      const res = await POST(new NextRequest(WEBHOOK_URL, { method: "POST", body }));

      expect(res.status).toBe(401);
    });

    it("aceita assinatura válida e confirma a consulta pendente do telefone", async () => {
      const { clinic, doctor } = await seedClinicWithOwnerAndDoctor();
      const patient = await seedPatient(clinic.id, { phoneNumber: "+55 11 99999-9999" });

      const appointment = Appointment.create({
        clinicId: clinic.id,
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        priceInCents: 10000,
      });
      await new DrizzleAppointmentRepository().save(appointment);

      const body = JSON.stringify(
        buildIncomingMessagePayload({ from: "5511999999999", text: "sim" }),
      );

      const res = await POST(
        new NextRequest(WEBHOOK_URL, {
          method: "POST",
          body,
          headers: { "x-hub-signature-256": sign(body) },
        }),
      );

      expect(res.status).toBe(200);

      const [row] = await db
        .select()
        .from(appointmentsTable)
        .where(eq(appointmentsTable.id, appointment.id));
      expect(row.status).toBe("confirmed");
    });
  });
});
