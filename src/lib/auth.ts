import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, customSession } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { resolveClinicAccess } from "@/core/modules/clinics/domain/clinic-access";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { usersTable, usersToClinicsTable } from "@/db/schema";

import {
  createPasswordResetEmailTemplate,
  createVerificationEmailTemplate,
  sendEmail,
} from "./email";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        const { subject, html, text } = createVerificationEmailTemplate(
          user.name,
          url,
        );

        await sendEmail({
          to: user.email,
          subject,
          html,
          text,
        });

        console.log(`E-mail de verificação enviado para ${user.email}`);
      } catch (error) {
        console.error("Erro ao enviar e-mail de verificação:", error);
        throw error;
      }
    },
  },
  plugins: [
    // Usado apenas server-side (auth.api.createUser) para provisionar a
    // conta do responsável quando o admin de plataforma cria uma clínica
    // (ver ClinicOwnerProvisioner). Não expõe rotas de admin no client.
    admin(),
    customSession(async ({ user, session }) => {
      // TODO: colocar cache
      const [userData, clinics] = await Promise.all([
        db.query.usersTable.findFirst({
          where: eq(usersTable.id, user.id),
        }),
        db.query.usersToClinicsTable.findMany({
          where: eq(usersToClinicsTable.userId, user.id),
          with: {
            clinic: true,
            user: true,
          },
        }),
      ]);
      // TODO: Ao adaptar para o usuário ter múltiplas clínicas, deve-se mudar esse código
      const clinic = clinics?.[0];
      const clinicRow = clinic?.clinic;

      // Acesso efetivo da clínica: status (bloqueio) + override de plano da
      // plataforma têm precedência sobre o plano "de base" do dono.
      const access = clinicRow
        ? resolveClinicAccess({
            status: clinicRow.status,
            planOverride: clinicRow.planOverride ?? null,
            planOverrideExpiresAt: clinicRow.planOverrideExpiresAt ?? null,
            basePlan: userData?.plan ?? null,
            basePlanExpiresAt: userData?.planExpiresAt ?? null,
            now: new Date(),
          })
        : null;

      return {
        user: {
          ...user,
          // Telefone do responsável: não está em `additionalFields`, então o
          // `user` do BetterAuth não o carrega — vem da consulta direta acima.
          phoneNumber: userData?.phoneNumber ?? null,
          // Plano efetivo: respeita cortesia/override concedido pela plataforma.
          plan: access ? access.effectivePlan : userData?.plan,
          platformRole: userData?.platformRole ?? "member",
          // Mantido por compatibilidade (clínica "atual" = primeira).
          clinic: clinic?.clinicId
            ? {
                id: clinic?.clinicId,
                name: clinicRow?.name,
                type: clinicRow?.type,
                status: clinicRow?.status,
                blockedReason: clinicRow?.blockedReason ?? null,
              }
            : undefined,
          // Todas as clínicas do usuário com o papel em cada uma.
          clinics: clinics.map((membership) => ({
            id: membership.clinicId,
            name: membership.clinic?.name,
            type: membership.clinic?.type,
            role: membership.role,
          })),
        },
        session,
      };
    }),
  ],
  user: {
    modelName: "usersTable",
    additionalFields: {
      stripeCustomerId: {
        type: "string",
        fieldName: "stripeCustomerId",
        required: false,
      },
      stripeSubscriptionId: {
        type: "string",
        fieldName: "stripeSubscriptionId",
        required: false,
      },
      plan: {
        type: "string",
        fieldName: "plan",
        required: false,
      },
      platformRole: {
        type: "string",
        fieldName: "platformRole",
        required: false,
      },
      phoneNumber: {
        type: "string",
        fieldName: "phoneNumber",
        required: false,
      },
    },
  },
  session: {
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      const { subject, html, text } = createPasswordResetEmailTemplate(
        user.name,
        url,
      );

      void sendEmail({
        to: user.email,
        subject,
        html,
        text,
      }).catch((error) => {
        console.error("Erro ao enviar e-mail de redefinição de senha:", error);
      });
    },
  },
});
