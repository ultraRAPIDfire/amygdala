import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ApproveButton } from "./approve-button";

const intentVariant = {
  COMPLAINT: "destructive",
  INQUIRY: "default",
  REFUND: "warning",
  ORDER: "success",
  PARTNERSHIP: "secondary",
  OTHER: "outline",
} as const;

export default async function EmailPage() {
  const session = await auth();
  const organizationId = session!.user.organizationId;

  const threads = await prisma.emailThread.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Email AI</h1>
        <p className="text-sm text-muted-foreground">
          n8n reads incoming email → AI classifies intent → drafts a reply → staff approves → sends.
        </p>
      </div>

      <div className="space-y-4">
        {threads.map((t) => (
          <Card key={t.id}>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle className="text-base font-semibold text-foreground">
                  {t.subject}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{t.fromAddress}</p>
              </div>
              <Badge variant={intentVariant[t.intent]}>{t.intent}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md border border-border p-3 text-sm text-muted-foreground">
                {t.body}
              </div>
              {t.draftReply && (
                <div className="space-y-2 rounded-md border border-primary/30 bg-primary/5 p-3">
                  <p className="text-xs font-medium text-primary">AI-drafted reply</p>
                  <p className="text-sm">{t.draftReply}</p>
                  <div className="flex items-center gap-2 pt-1">
                    {t.approved ? (
                      <Badge variant="success">Approved &amp; sent</Badge>
                    ) : (
                      <ApproveButton emailId={t.id} />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
