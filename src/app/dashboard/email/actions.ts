"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function approveEmailReply(emailId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.emailThread.update({
    where: { id: emailId, organizationId: session.user.organizationId },
    data: { approved: true },
  });

  await prisma.aiTask.create({
    data: {
      organizationId: session.user.organizationId,
      label: "Staff approved AI-drafted email reply",
      category: "email",
    },
  });

  revalidatePath("/dashboard/email");
}
