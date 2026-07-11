import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  message: z.string().min(1).max(2000),
});

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const organizationId = session.user.organizationId;
  const webhookUrl = process.env.N8N_ASSISTANT_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { reply: "The AI assistant isn't connected yet — set N8N_ASSISTANT_WEBHOOK_URL." },
      { status: 200 }
    );
  }

  const [todaysAppointments, newLeads, pendingInvoices, aiTasksToday] = await Promise.all([
    prisma.appointment.count({
      where: { organizationId, startsAt: { gte: startOfToday() } },
    }),
    prisma.lead.count({ where: { organizationId, status: "NEW" } }),
    prisma.invoice.count({
      where: { organizationId, status: { in: ["SENT", "OVERDUE", "DRAFT"] } },
    }),
    prisma.aiTask.count({ where: { organizationId, completedAt: { gte: startOfToday() } } }),
  ]);

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: parsed.data.message,
        context: {
          organizationName: session.user.name,
          todaysAppointments,
          newLeads,
          pendingInvoices,
          aiTasksToday,
        },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      return NextResponse.json({ reply: "The AI assistant had trouble responding — try again in a moment." });
    }

    const data = await res.json().catch(() => null);
    const reply = data?.reply ?? "The AI assistant didn't return a response.";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("AI assistant webhook call failed:", err);
    return NextResponse.json({ reply: "Couldn't reach the AI assistant — check the n8n workflow is active." });
  }
}
