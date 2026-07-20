import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const userPlatformRoleEnum = pgEnum("user_platform_role", [
  "platform_admin",
  "member",
]);

export const clinicRoleEnum = pgEnum("clinic_role", [
  "owner",
  "manager",
  "professional",
  "staff",
]);

export const clinicTypeEnum = pgEnum("clinic_type", [
  "medical",
  "dental",
  "physiotherapy",
  "nutrition",
  "psychology",
  "multidisciplinary",
]);

export const clinicStatusEnum = pgEnum("clinic_status", ["active", "blocked"]);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending",
  "confirmed",
  "cancelled",
  "no_show",
]);

// "consultation" = primeira consulta/avaliação; "return_visit" = retorno de
// um atendimento anterior. Puramente informativo (não afeta preço/conflito).
export const appointmentTypeEnum = pgEnum("appointment_type", [
  "consultation",
  "return_visit",
]);

export const userPlanEnum = pgEnum("user_plan", [
  "trial",
  "essential",
  "premium",
  "gold",
]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  phoneNumber: text("phone_number"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan"), // modificar aqui para adcionar os planos
  // Validade do plano "de base" (hoje só usado pelo trial gratuito). null =
  // sem expiração (ex.: assinatura paga via gateway). Espelha o par
  // planOverride/planOverrideExpiresAt da clínica.
  planExpiresAt: timestamp("plan_expires_at"),
  // Marca se o usuário já iniciou um teste grátis alguma vez (evita reiniciar
  // o trial após expirar ou cancelar).
  hasUsedTrial: boolean("has_used_trial").notNull().default(false),
  platformRole: userPlatformRoleEnum("platform_role")
    .notNull()
    .default("member"),
  // Campos exigidos pelo schema interno do plugin "admin" do BetterAuth
  // (better-auth/plugins), usado hoje apenas server-side por
  // auth.api.createUser (ver ClinicOwnerProvisioner). Não confundir com
  // "platformRole" acima, que é o RBAC próprio da aplicação
  // (member/platform_admin) — "role" é um conceito interno do plugin, não
  // exposto/usado pela aplicação.
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const usersTableRelations = relations(usersTable, ({ many }) => ({
  usersToClinics: many(usersToClinicsTable),
}));

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const clinicsTable = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  type: clinicTypeEnum("type").notNull().default("medical"),
  // Status de acesso da clínica (gestão da plataforma). "blocked" suspende o
  // acesso de todos os usuários da clínica.
  status: clinicStatusEnum("status").notNull().default("active"),
  blockedReason: text("blocked_reason"),
  // Override de plano concedido pela plataforma (ex.: cortesia/desconto),
  // independente do gateway de pagamento. Tem precedência sobre o plano do dono
  // enquanto válido. Vazio = sem override (usa o plano do dono).
  planOverride: text("plan_override"),
  planOverrideExpiresAt: timestamp("plan_override_expires_at"),
  // ID do número do WhatsApp (Meta) que atende esta clínica. Permite rotear o
  // webhook multi-tenant: cada clínica tem seu próprio número.
  whatsappPhoneNumberId: text("whatsapp_phone_number_id").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersToClinicsTable = pgTable("users_to_clinics", {
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  role: clinicRoleEnum("role").notNull().default("owner"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersToClinicsTableRelations = relations(
  usersToClinicsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [usersToClinicsTable.userId],
      references: [usersTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [usersToClinicsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

export const clinicsTableRelations = relations(clinicsTable, ({ many }) => ({
  doctors: many(doctorsTable),
  patients: many(patientsTable),
  appointments: many(appointmentsTable),
  usersToClinics: many(usersToClinicsTable),
}));

export const doctorsTable = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avatarImageUrl: text("avatar_image_url"),
  phoneNumber: text("phone_number"),
  speciality: text("speciality").notNull(),
  // 0- sunday, 1- monday, 2- tuesday, 3- wednesday, 4- thursday, 5- friday, 6- saturday
  availableFromWeekDay: integer("available_from_week_day").notNull(), // 1
  availableToWeekDay: integer("available_to_week_day").notNull(), // 5
  availableFromTime: time("available_from_time").notNull(),
  availableToTime: time("available_to_time").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const doctorsTableRelations = relations(
  doctorsTable,
  ({ many, one }) => ({
    clinic: one(clinicsTable, {
      fields: [doctorsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
  }),
);

export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);

export const patientsTable = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number").notNull(),
  sex: patientSexEnum("sex").notNull(),
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const patientsTableRelations = relations(
  patientsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [patientsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
    medicalRecord: one(medicalRecordsTable, {
      fields: [patientsTable.id],
      references: [medicalRecordsTable.patientId],
    }),
    clinicalAttendances: many(clinicalAttendancesTable),
    diagnoses: many(diagnosesTable),
    prescriptions: many(prescriptionsTable),
    followUps: many(followUpsTable),
  }),
);

export const appointmentsTable = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  status: appointmentStatusEnum("status").notNull().default("pending"),
  type: appointmentTypeEnum("type").notNull().default("consultation"),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const appointmentsTableRelations = relations(
  appointmentsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [appointmentsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [appointmentsTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [appointmentsTable.doctorId],
      references: [doctorsTable.id],
    }),
    clinicalAttendances: many(clinicalAttendancesTable),
  }),
);

/* -------------------------------------------------------------------------- */
/*                          PRONTUÁRIO ELETRÔNICO                             */
/* -------------------------------------------------------------------------- */

/**
 * Prontuário base do paciente: dados que mudam pouco e descrevem o histórico
 * de saúde geral (antecedentes, alergias, hábitos, medicamentos em uso).
 * Relação 1:1 com o paciente.
 */
export const medicalRecordsTable = pgTable("medical_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .unique()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  bloodType: text("blood_type"),
  allergies: text("allergies"), // alergias
  medicationsInUse: text("medications_in_use"), // medicamentos em uso
  clinicalHistory: text("clinical_history"), // antecedentes clínicos
  surgicalHistory: text("surgical_history"), // antecedentes cirúrgicos
  familyHistory: text("family_history"), // antecedentes familiares
  habits: text("habits"), // hábitos (tabagismo, álcool, atividade física...)
  notes: text("notes"), // observações gerais
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const medicalRecordsTableRelations = relations(
  medicalRecordsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [medicalRecordsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [medicalRecordsTable.patientId],
      references: [patientsTable.id],
    }),
  }),
);

/**
 * Atendimento clínico: o que aconteceu numa consulta (anamnese, exame físico,
 * conduta). Pode ou não estar vinculado a um agendamento existente.
 */
export const clinicalAttendancesTable = pgTable("clinical_attendances", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id").references(() => doctorsTable.id, {
    onDelete: "set null",
  }),
  appointmentId: uuid("appointment_id").references(() => appointmentsTable.id, {
    onDelete: "set null",
  }),
  date: timestamp("date").notNull().defaultNow(),
  chiefComplaint: text("chief_complaint"), // queixa principal
  historyOfPresentIllness: text("history_of_present_illness"), // história da doença atual
  physicalExam: text("physical_exam"), // exame físico
  conduct: text("conduct"), // conduta / plano
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const clinicalAttendancesTableRelations = relations(
  clinicalAttendancesTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [clinicalAttendancesTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [clinicalAttendancesTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [clinicalAttendancesTable.doctorId],
      references: [doctorsTable.id],
    }),
    appointment: one(appointmentsTable, {
      fields: [clinicalAttendancesTable.appointmentId],
      references: [appointmentsTable.id],
    }),
    diagnoses: many(diagnosesTable),
    prescriptions: many(prescriptionsTable),
  }),
);

export const diagnosisStatusEnum = pgEnum("diagnosis_status", [
  "active", // ativo
  "resolved", // resolvido
  "chronic", // crônico
]);

export const diagnosesTable = pgTable("diagnoses", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  attendanceId: uuid("attendance_id").references(
    () => clinicalAttendancesTable.id,
    { onDelete: "set null" },
  ),
  description: text("description").notNull(),
  cid10Code: text("cid10_code"), // código CID-10
  status: diagnosisStatusEnum("status").notNull().default("active"),
  date: timestamp("date").notNull().defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const diagnosesTableRelations = relations(diagnosesTable, ({ one }) => ({
  clinic: one(clinicsTable, {
    fields: [diagnosesTable.clinicId],
    references: [clinicsTable.id],
  }),
  patient: one(patientsTable, {
    fields: [diagnosesTable.patientId],
    references: [patientsTable.id],
  }),
  attendance: one(clinicalAttendancesTable, {
    fields: [diagnosesTable.attendanceId],
    references: [clinicalAttendancesTable.id],
  }),
}));

export const prescriptionsTable = pgTable("prescriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id").references(() => doctorsTable.id, {
    onDelete: "set null",
  }),
  attendanceId: uuid("attendance_id").references(
    () => clinicalAttendancesTable.id,
    { onDelete: "set null" },
  ),
  medication: text("medication").notNull(), // medicamento
  dosage: text("dosage"), // dosagem (ex.: 500mg)
  frequency: text("frequency"), // frequência (ex.: 8/8h)
  duration: text("duration"), // duração (ex.: 7 dias)
  instructions: text("instructions"), // instruções adicionais
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const prescriptionsTableRelations = relations(
  prescriptionsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [prescriptionsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [prescriptionsTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [prescriptionsTable.doctorId],
      references: [doctorsTable.id],
    }),
    attendance: one(clinicalAttendancesTable, {
      fields: [prescriptionsTable.attendanceId],
      references: [clinicalAttendancesTable.id],
    }),
  }),
);

export const followUpStatusEnum = pgEnum("follow_up_status", [
  "pending", // pendente
  "in_progress", // em andamento
  "completed", // concluído
  "cancelled", // cancelado
]);

/**
 * Acompanhamento: plano de seguimento do paciente (retornos, controle de
 * medidas, metas terapêuticas, etc.).
 */
export const followUpsTable = pgTable("follow_ups", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // título do acompanhamento
  description: text("description"),
  status: followUpStatusEnum("status").notNull().default("pending"),
  scheduledDate: timestamp("scheduled_date"), // data prevista de retorno
  completedDate: timestamp("completed_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const followUpsTableRelations = relations(
  followUpsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [followUpsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [followUpsTable.patientId],
      references: [patientsTable.id],
    }),
  }),
);

export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id").references(() => clinicsTable.id, {
    onDelete: "set null",
  }),
  actorUserId: text("actor_user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notificationsTable = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  appointmentId: uuid("appointment_id").references(() => appointmentsTable.id, {
    onDelete: "set null",
  }),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/**
 * Rastreia os lembretes agendados no QStash por consulta, para permitir
 * cancelamento real (DELETE na fila) quando a consulta é remarcada/cancelada.
 * Sem isso, `cancelForAppointment` não teria como saber quais mensagens
 * cancelar no provedor de fila.
 */
export const appointmentRemindersTable = pgTable("appointment_reminders", {
  id: uuid("id").defaultRandom().primaryKey(),
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointmentsTable.id, { onDelete: "cascade" }),
  qstashMessageId: text("qstash_message_id").notNull(),
  runAt: timestamp("run_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const whatsappConversationsTable = pgTable("whatsapp_conversations", {
  phone: text("phone").primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  step: text("step").notNull(),
  data: jsonb("data"),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
