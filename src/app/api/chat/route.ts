import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const requestSchema = z.object({
  conversationId: z.string().nullish(),
  message: z.string().min(1).max(2000),
});

const DEMO_ORG_SLUG = "acme-co";
const MAX_KB_CONTEXT_CHARS = 4000;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const org = await prisma.organization.findUnique({ where: { slug: DEMO_ORG_SLUG } });
  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 500 });
  }

  let conversation = parsed.data.conversationId
    ? await prisma.conversation.findFirst({
        where: { id: parsed.data.conversationId, organizationId: org.id },
      })
    : null;

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        organizationId: org.id,
        customerName: `Website Visitor #${Math.floor(1000 + Math.random() * 9000)}`,
        channel: "web",
        resolvedByAi: true,
      },
    });
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, role: "customer", content: parsed.data.message },
  });

  const kbArticles = await prisma.knowledgeBaseArticle.findMany({
    where: { organizationId: org.id },
  });
  const kbContext = kbArticles
    .map((a) => `${a.title}: ${a.content}`)
    .join("\n\n")
    .slice(0, MAX_KB_CONTEXT_CHARS);

  const webhookUrl = process.env.N8N_CHAT_WEBHOOK_URL;
  let reply = "The AI customer chat isn't connected yet — set N8N_CHAT_WEBHOOK_URL.";
  let escalate = false;

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: parsed.data.message, kbContext }),
        signal: AbortSignal.timeout(20000),
      });

      if (res.ok) {
        const data = await res.json().catch(() => null);
        reply = data?.reply ?? "Sorry, I couldn't generate a response.";
        escalate = Boolean(data?.escalate);
      } else {
        reply = "The AI assistant had trouble responding — a team member will follow up.";
        escalate = true;
      }
    } catch (err) {
      console.error("Customer chat webhook call failed:", err);
      reply = "Couldn't reach the AI assistant — a team member will follow up.";
      escalate = true;
    }
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, role: "ai", content: reply },
  });

  if (escalate) {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { resolvedByAi: false },
    });
    await prisma.notification.create({
      data: {
        organizationId: org.id,
        type: "WARNING",
        title: "Customer chat escalated",
        body: `${conversation.customerName} asked something the AI couldn't answer confidently.`,
      },
    });
  }

  await prisma.aiTask.create({
    data: {
      organizationId: org.id,
      label: escalate
        ? `AI escalated a customer chat from ${conversation.customerName} to staff`
        : `AI answered a customer chat from ${conversation.customerName}`,
      category: "chat",
    },
  });

  return NextResponse.json({ conversationId: conversation.id, reply, escalated: escalate });
}
