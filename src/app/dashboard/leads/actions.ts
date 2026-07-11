"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const leadSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email().or(z.literal("")).optional(),
  phone: z.string().max(50).optional(),
  source: z.string().max(100).optional(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"]),
  assignedToId: z.string().max(200).optional(),
});

async function requireOrgId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.organizationId;
}

function parseLeadForm(formData: FormData) {
  const assignedToId = formData.get("assignedToId");
  return leadSchema.parse({
    name: formData.get("name"),
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    source: formData.get("source") || undefined,
    status: formData.get("status"),
    assignedToId: assignedToId && assignedToId !== "unassigned" ? assignedToId : undefined,
  });
}

export async function createLead(formData: FormData) {
  const organizationId = await requireOrgId();
  const { assignedToId, ...rest } = parseLeadForm(formData);

  await prisma.lead.create({
    data: { organizationId, assignedToId: assignedToId ?? null, ...rest },
  });
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
}

export async function updateLead(leadId: string, formData: FormData) {
  const organizationId = await requireOrgId();
  const { assignedToId, ...rest } = parseLeadForm(formData);

  await prisma.lead.update({
    where: { id: leadId, organizationId },
    data: { assignedToId: assignedToId ?? null, ...rest },
  });
  revalidatePath("/dashboard/leads");
}

export async function deleteLead(leadId: string) {
  const organizationId = await requireOrgId();
  await prisma.lead.delete({ where: { id: leadId, organizationId } });
  revalidatePath("/dashboard/leads");
  revalidatePath("/dashboard");
}
