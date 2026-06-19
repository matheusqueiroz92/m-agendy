import { headers } from "next/headers";

import { auth } from "@/lib/auth";

import { AuthenticatedActor } from "../domain/authenticated-actor";
import { ClinicRole, PlatformRole } from "../domain/roles";

/**
 * Adapter que traduz a sessão do BetterAuth para o value object
 * AuthenticatedActor usado pelo domínio. É o único ponto que conhece o formato
 * da sessão — os casos de uso recebem apenas o ator.
 */
export const getAuthenticatedActor =
  async (): Promise<AuthenticatedActor | null> => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return null;
    }

    const user = session.user as typeof session.user & {
      platformRole?: PlatformRole;
      clinics?: { id: string; role: ClinicRole }[];
    };

    return new AuthenticatedActor({
      userId: user.id,
      platformRole: user.platformRole ?? "member",
      memberships: (user.clinics ?? []).map((clinic) => ({
        clinicId: clinic.id,
        role: clinic.role,
      })),
    });
  };
