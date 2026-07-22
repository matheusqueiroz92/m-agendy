import { randomBytes } from "crypto";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import {
  ClinicOwnerProvisioner,
  ProvisionClinicOwnerInput,
  ProvisionClinicOwnerOutput,
} from "../../application/ports/clinic-owner-provisioner";

/**
 * Adapter Drizzle + BetterAuth da porta `ClinicOwnerProvisioner`.
 *
 * Reaproveita um usuário existente com o mesmo e-mail; senão cria uma conta
 * nova com uma senha aleatória descartável (nunca exposta) via
 * `auth.api.createUser` (plugin `admin` do BetterAuth) e dispara o e-mail de
 * "definir senha" reaproveitando o fluxo padrão de recuperação de senha
 * (`sendResetPassword`, já configurado em `src/lib/auth.ts`).
 *
 * A conta já nasce com `emailVerified: true`: clicar no link de "definir
 * senha" exige acesso à caixa de entrada, o que já prova a posse do e-mail —
 * sem isso, `requireEmailVerification: true` bloquearia o primeiro login e
 * disparasse um SEGUNDO e-mail (de verificação) depois que a pessoa já tivesse
 * acabado de definir a senha, invertendo a ordem esperada do onboarding.
 */
export class DrizzleClinicOwnerProvisioner implements ClinicOwnerProvisioner {
  async provision(
    input: ProvisionClinicOwnerInput,
  ): Promise<ProvisionClinicOwnerOutput> {
    const existing = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, input.email),
      columns: { id: true },
    });

    if (existing) {
      return { userId: existing.id, createdNewAccount: false };
    }

    // Senha aleatória descartável: ninguém (nem o admin) chega a vê-la — o
    // acesso real acontece pelo link de "definir senha" enviado por e-mail.
    const temporaryPassword = randomBytes(24).toString("base64url");

    const created = await auth.api.createUser({
      body: {
        email: input.email,
        password: temporaryPassword,
        name: input.name,
      },
    });

    await db
      .update(usersTable)
      .set({
        emailVerified: true,
        ...(input.phoneNumber ? { phoneNumber: input.phoneNumber } : {}),
      })
      .where(eq(usersTable.id, created.user.id));

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
    await auth.api.forgetPassword({
      body: {
        email: input.email,
        redirectTo: `${appUrl}/auth/reset-password`,
      },
    });

    return { userId: created.user.id, createdNewAccount: true };
  }
}
