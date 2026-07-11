"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email().or(z.literal("")).optional(),
  phone: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
});

async function requireOrgId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.organizationId;
}

export async function createCustomer(formData: FormData) {
  const organizationId = await requireOrgId();
  const parsed = customerSchema.parse({
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    notes: formData.get("notes") || undefined,
  });

  await prisma.customer.create({ data: { organizationId, ...parsed } });
  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard");
}

export async function updateCustomer(customerId: string, formData: FormData) {
  const organizationId = await requireOrgId();
  const parsed = customerSchema.parse({
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    notes: formData.get("notes") || undefined,
  });

  await prisma.customer.update({
    where: { id: customerId, organizationId },
    data: parsed,
  });
  revalidatePath("/dashboard/crm");
}

export async function deleteCustomer(customerId: string) {
  const organizationId = await requireOrgId();
  await prisma.customer.delete({ where: { id: customerId, organizationId } });
  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard");
}
