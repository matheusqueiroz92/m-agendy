import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { resolveLandingRoute } from "@/core/modules/iam/domain/landing-route";
import { DrizzlePortalPatientDirectory } from "@/core/modules/patient-portal/infra/persistence/drizzle-portal-patient-directory";
import { auth } from "@/lib/auth";

/**
 * Rota de aterrissagem pós-login. Decide o destino conforme o perfil
 * (equipe de clínica → dashboard/assinatura; paciente → portal; novo dono →
 * onboarding) e aproveita para fazer o auto-vínculo do paciente por e-mail.
 */
const EntrarPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  const isPlatformAdmin =
    (session.user as { platformRole?: string }).platformRole ===
    "platform_admin";
  const hasClinic = Boolean(session.user.clinic);
  const isClinicBlocked =
    (session.user.clinic as { status?: string } | undefined)?.status ===
    "blocked";
  const hasPlan = Boolean(session.user.plan);

  let isPatient = false;
  if (!hasClinic) {
    // Resolve (e vincula por e-mail) o paciente apenas para quem não é equipe.
    const directory = new DrizzlePortalPatientDirectory();
    const patient =
      (await directory.findByUserId(session.user.id)) ??
      (await directory.linkByEmail({
        userId: session.user.id,
        email: session.user.email,
      }));
    isPatient = Boolean(patient);
  }

  redirect(
    resolveLandingRoute({
      isPlatformAdmin,
      isClinicBlocked,
      hasClinic,
      hasPlan,
      isPatient,
    }),
  );
};

export default EntrarPage;
