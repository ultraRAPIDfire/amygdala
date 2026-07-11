import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const leadSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  message: z.string().max(2000).optional(),
});

const DEMO_ORG_SLUG = "acme-co";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({ where: { slug: DEMO_ORG_SLUG } });
  if (!org) {
    return NextResponse.json({ error: "Organization not found." }, { status: 500 });
  }

  const lead = await prisma.lead.create({
    data: {
      organizationId: org.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      source: "Website Form",
      status: "NEW",
      aiInsight: parsed.data.message ? `Submitted message: "${parsed.data.message}"` : null,
    },
  });

  await prisma.notification.create({
    data: {
      organizationId: org.id,
      type: "SUCCESS",
      title: "New lead captured",
      body: `${lead.name} submitted the website form and was added to Leads.`,
    },
  });

  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "lead.captured",
          lead: {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            message: parsed.data.message ?? null,
            organizationId: org.id,
            createdAt: lead.createdAt,
          },
        }),
        signal: AbortSignal.timeout(5000),
      });
    } catch (err) {
      console.error("n8n webhook call failed:", err);
    }
  }

  return NextResponse.json({ ok: true, leadId: lead.id });
}
