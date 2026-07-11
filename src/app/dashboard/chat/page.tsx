import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ChatPage() {
  const session = await auth();
  const organizationId = session!.user.organizationId;

  const conversations = await prisma.conversation.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Customer Chat</h1>
        <p className="text-sm text-muted-foreground">
          Customers ask questions instantly. When the AI can&apos;t answer, n8n escalates to staff.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {conversations.map((c) => (
          <Card key={c.id}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base font-semibold text-foreground">
                {c.customerName}
              </CardTitle>
              <Badge variant={c.resolvedByAi ? "success" : "warning"}>
                {c.resolvedByAi ? "Resolved by AI" : "Escalated to staff"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {c.messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === "customer"
                      ? "mr-auto max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm"
                      : "ml-auto max-w-[85%] rounded-lg bg-primary/10 px-3 py-2 text-sm"
                  }
                >
                  {m.content}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
