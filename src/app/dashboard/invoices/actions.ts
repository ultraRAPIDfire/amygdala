"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const invoiceSchema = z.object({
  number: z.string().min(1, "Invoice number is required").max(50),
  customerId: z.string().min(1, "Customer is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]),
  dueDate: z.string().min(1, "Due date is required"),
});

async function requireOrgId() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.organizationId;
}

function parseInvoiceForm(formData: FormData) {
  const parsed = invoiceSchema.parse({
    number: formData.get("number"),
    customerId: formData.get("customerId"),
    amount: formData.get("amount"),
    status: formData.get("status"),
    dueDate: formData.get("dueDate"),
  });
  return { ...parsed, dueDate: new Date(parsed.dueDate) };
}

export async function createInvoice(formData: FormData) {
  const organizationId = await requireOrgId();
  const parsed = parseInvoiceForm(formData);

  await prisma.invoice.create({ data: { organizationId, ...parsed } });
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
}

export async function updateInvoice(invoiceId: string, formData: FormData) {
  const organizationId = await requireOrgId();
  const parsed = parseInvoiceForm(formData);

  await prisma.invoice.update({
    where: { id: invoiceId, organizationId },
    data: parsed,
  });
  revalidatePath("/dashboard/invoices");
}

export async function deleteInvoice(invoiceId: string) {
  const organizationId = await requireOrgId();
  await prisma.invoice.delete({ where: { id: invoiceId, organizationId } });
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard");
}
