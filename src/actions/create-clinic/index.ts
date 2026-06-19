"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ClinicType } from "@/core/modules/clinics/domain/clinic-type";
import { db } from "@/db";
import { clinicsTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function createClinic(
  name: string,
  type: ClinicType = "medical",
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const [clinic] = await db
    .insert(clinicsTable)
    .values({ name, type })
    .returning();

  await db.insert(usersToClinicsTable).values({
    userId: session.user.id,
    clinicId: clinic.id,
    role: "owner",
  });

  redirect("/dashboard");
}
