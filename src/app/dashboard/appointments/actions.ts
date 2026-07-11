"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const appointmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  customerId: z.string().min(1, "Customer is required"),
  startsAt: z.string().min(1, "Date/time is required"),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"]),
});

async function requireOrgId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.organizationId;
}

function parseAppointmentForm(formData: FormData) {
  const parsed = appointmentSchema.parse({
    title: formData.get("title"),
    customerId: formData.get("customerId"),
    startsAt: formData.get("startsAt"),
    status: formData.get("status"),
  });
  return { ...parsed, startsAt: new Date(parsed.startsAt) };
}

export async function createAppointment(formData: FormData) {
  const organizationId = await requireOrgId();
  const parsed = parseAppointmentForm(formData);

  await prisma.appointment.create({ data: { organizationId, ...parsed } });
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/analytics");
}

export async function updateAppointment(appointmentId: string, formData: FormData) {
  const organizationId = await requireOrgId();
  const parsed = parseAppointmentForm(formData);

  await prisma.appointment.update({
    where: { id: appointmentId, organizationId },
    data: parsed,
  });
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard/analytics");
}

export async function deleteAppointment(appointmentId: string) {
  const organizationId = await requireOrgId();
  await prisma.appointment.delete({ where: { id: appointmentId, organizationId } });
  revalidatePath("/dashboard/appointments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/analytics");
}
