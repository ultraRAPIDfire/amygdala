import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const callbackSchema = z.object({
  leadId: z.string().min(1),
  aiInsight: z.string().max(2000).optional(),
  priority: z.enum(["NEW", "CONTACTED", "QUALIFIED"]).optional(),
});

export async function POST(request: Request) {
  const secret = request.headers.get("x-n8n-secret");
  if (!secret || secret !== process.env.N8N_CALLBACK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = callbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { leadId, aiInsight, priority } = parsed.data;

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const orgUsers = await prisma.user.findMany({
    where: { organizationId: lead.organizationId },
  });

  let assignedTo: { id: string; name: string } | null = null;

  if (orgUsers.length > 0) {
    const loadCounts = await prisma.lead.groupBy({
      by: ["assignedToId"],
      where: {
        organizationId: lead.organizationId,
        assignedToId: { not: null },
        status: { in: ["NEW", "CONTACTED", "QUALIFIED"] },
      },
      _count: { _all: true },
    });

    const loadByUserId = new Map(orgUsers.map((u) => [u.id, 0]));
    for (const row of loadCounts) {
      if (row.assignedToId) loadByUserId.set(row.assignedToId, row._count._all);
    }

    const leastLoaded = [...loadByUserId.entries()].sort((a, b) => a[1] - b[1])[0];
    const user = orgUsers.find((u) => u.id === leastLoaded[0]);
    if (user) assignedTo = { id: user.id, name: user.name };
  }

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: {
      assignedToId: assignedTo?.id,
      aiInsight: aiInsight ?? lead.aiInsight,
      status: priority ?? lead.status,
    },
  });

  await prisma.aiTask.create({
    data: {
      organizationId: lead.organizationId,
      label: assignedTo
        ? `AI triaged lead "${lead.name}" and assigned it to ${assignedTo.name}`
        : `AI triaged lead "${lead.name}"`,
      category: "leads",
    },
  });

  if (assignedTo) {
    await prisma.notification.create({
      data: {
        organizationId: lead.organizationId,
        type: "SUCCESS",
        title: "Lead auto-assigned",
        body: `${lead.name} was assigned to ${assignedTo.name} by the AI triage workflow.`,
      },
    });
  }

  return NextResponse.json({
    leadId: updated.id,
    name: updated.name,
    email: updated.email,
    status: updated.status,
    aiInsight: updated.aiInsight,
    assignedTo,
  });
}
