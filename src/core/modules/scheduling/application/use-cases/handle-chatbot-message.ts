import { Clock } from "@/core/shared/application/ports/clock";

import {
  CHATBOT_STEPS,
  combineDateTime,
  formatNumberedList,
  isCancel,
  parseDate,
  parseSelection,
  toISODate,
} from "../../domain/chatbot";
import {
  ChatAvailability,
  ChatClinicResolver,
  ChatPatientLookup,
  ChatProfessionalsCatalog,
  ChatScheduler,
  ConversationStore,
  WhatsAppMessenger,
} from "../ports/chatbot-ports";

export interface HandleChatbotMessageInput {
  fromPhone: string;
  text: string;
  /** phone_number_id do número Meta que recebeu a mensagem (roteamento multi-tenant). */
  phoneNumberId?: string | null;
}

const APP_URL = process.env.APP_URL ?? "";

/**
 * Conduz a conversa de agendamento pelo WhatsApp (paciente já cadastrado).
 * Telefone desconhecido recebe o link público. Conversa stateful por telefone.
 */
export class HandleChatbotMessageUseCase {
  constructor(
    private readonly store: ConversationStore,
    private readonly clinicResolver: ChatClinicResolver,
    private readonly patients: ChatPatientLookup,
    private readonly catalog: ChatProfessionalsCatalog,
    private readonly availability: ChatAvailability,
    private readonly scheduler: ChatScheduler,
    private readonly messenger: WhatsAppMessenger,
    private readonly clock: Clock,
  ) {}

  async execute(input: HandleChatbotMessageInput): Promise<void> {
    const phone = input.fromPhone;
    const text = input.text.trim();

    const convo = await this.store.get(phone);

    // Resolvida antes do cancelamento para que a própria resposta de
    // cancelamento já saia pelo número da clínica (quando ela tiver um).
    const clinicId =
      convo?.clinicId ??
      (await this.clinicResolver.resolveInboundClinicId({
        phoneNumberId: input.phoneNumberId,
      }));

    const reply = (body: string) =>
      this.messenger.sendText({ to: phone, body, clinicId: clinicId ?? undefined });

    if (isCancel(text)) {
      if (convo) await this.store.clear(phone);
      await reply("Tudo bem, agendamento cancelado. 👋");
      return;
    }

    // Sem clínica identificada (número compartilhado, sem dono cadastrado):
    // não dá pra saber com segurança de qual clínica é essa conversa nova,
    // então não inicia o agendamento por chat — orienta a usar o link direto.
    if (!clinicId) {
      await reply(
        "No momento não é possível agendar por aqui. Peça à recepção da clínica o link de agendamento online.",
      );
      return;
    }

    const patient = await this.patients.findByPhone({ clinicId, phone });
    if (!patient) {
      const link = APP_URL ? `${APP_URL}/agendar/${clinicId}` : "";
      await reply(
        "Não encontramos seu cadastro. Para agendar, acesse o link da clínica" +
          (link ? `: ${link}` : "."),
      );
      return;
    }

    // Início de conversa: oferece os profissionais.
    if (!convo) {
      const professionals = await this.catalog.listByClinic(clinicId);
      if (professionals.length === 0) {
        await reply("No momento não há profissionais disponíveis.");
        return;
      }
      await this.store.save(phone, {
        clinicId,
        step: CHATBOT_STEPS.CHOOSING_PROFESSIONAL,
        data: { professionals },
      });
      await reply(
        `Olá, ${patient.name}! Com quem deseja agendar?\n\n` +
          formatNumberedList(professionals.map((p) => p.label)) +
          "\n\nResponda com o número. (ou 'cancelar')",
      );
      return;
    }

    if (convo.step === CHATBOT_STEPS.CHOOSING_PROFESSIONAL) {
      const options = convo.data.professionals ?? [];
      const index = parseSelection(text, options.length);
      if (index === null) {
        await reply("Não entendi. Responda com o número do profissional.");
        return;
      }
      const chosen = options[index];
      await this.store.save(phone, {
        clinicId,
        step: CHATBOT_STEPS.CHOOSING_DATE,
        data: { ...convo.data, doctorId: chosen.id, doctorLabel: chosen.label },
      });
      await reply("Para qual dia? Envie no formato DD/MM/AAAA.");
      return;
    }

    if (convo.step === CHATBOT_STEPS.CHOOSING_DATE) {
      const today = this.clock.now();
      const date = parseDate(text, today);
      if (!date) {
        await reply("Data inválida. Envie no formato DD/MM/AAAA.");
        return;
      }
      const dateISO = toISODate(date);
      const times = await this.availability.listFreeTimes({
        clinicId,
        doctorId: convo.data.doctorId!,
        dateISO,
      });
      if (times.length === 0) {
        await reply("Não há horários livres nesse dia. Tente outra data.");
        return;
      }
      await this.store.save(phone, {
        clinicId,
        step: CHATBOT_STEPS.CHOOSING_TIME,
        data: { ...convo.data, dateISO, times },
      });
      await reply(
        "Horários disponíveis:\n\n" +
          formatNumberedList(times) +
          "\n\nResponda com o número.",
      );
      return;
    }

    if (convo.step === CHATBOT_STEPS.CHOOSING_TIME) {
      const times = convo.data.times ?? [];
      const index = parseSelection(text, times.length);
      if (index === null) {
        await reply("Não entendi. Responda com o número do horário.");
        return;
      }
      const time = times[index];
      const dateISO = convo.data.dateISO!;
      const doctorId = convo.data.doctorId!;
      const scheduledAt = combineDateTime(dateISO, time);

      const result = await this.scheduler.book({
        clinicId,
        patientId: patient.patientId,
        doctorId,
        scheduledAt,
      });

      // Corrida: alguém pegou o horário entre a listagem e a confirmação.
      if (result === "conflict") {
        const freshTimes = await this.availability.listFreeTimes({
          clinicId,
          doctorId,
          dateISO,
        });
        if (freshTimes.length > 0) {
          await this.store.save(phone, {
            clinicId,
            step: CHATBOT_STEPS.CHOOSING_TIME,
            data: { ...convo.data, times: freshTimes },
          });
          await reply(
            "Ops, esse horário acabou de ser preenchido. Ainda há estes:\n\n" +
              formatNumberedList(freshTimes) +
              "\n\nResponda com o número.",
          );
        } else {
          await this.store.save(phone, {
            clinicId,
            step: CHATBOT_STEPS.CHOOSING_DATE,
            data: { ...convo.data, times: [] },
          });
          await reply(
            "Ops, esse horário acabou de ser preenchido e não há mais vagas nesse dia. Envie outra data (DD/MM/AAAA).",
          );
        }
        return;
      }

      await this.store.clear(phone);

      const [y, m, d] = dateISO.split("-");
      await reply(
        `✅ Consulta agendada para ${d}/${m}/${y} às ${time}. Até lá!`,
      );
      return;
    }
  }
}
