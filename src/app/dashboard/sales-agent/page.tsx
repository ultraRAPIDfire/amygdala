import { TrendingUp } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SalesAgentPage() {
  const session = await auth();
  const organizationId = session!.user.organizationId;

  const customers = await prisma.customer.findMany({
    where: { organizationId },
    include: { purchases: true },
    orderBy: { createdAt: "desc" },
  });

  const qualifiedLeads = await prisma.lead.findMany({
    where: { organizationId, status: { in: ["QUALIFIED", "NEW"] } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Sales Agent</h1>
        <p className="text-sm text-muted-foreground">
          Analyzes customer behavior, purchase history, and abandoned carts to surface who&apos;s
          likely to buy next.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Customer purchase signals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customers.map((c) => {
              const total = c.purchases.reduce((s, p) => s + Number(p.amount), 0);
              return (
                <div key={c.id} className="flex items-start gap-3 rounded-md border border-border p-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <TrendingUp className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{c.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(total)} lifetime
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{c.aiSummary}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              High-intent leads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {qualifiedLeads.map((l) => (
              <div key={l.id} className="flex items-start justify-between gap-3 rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{l.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{l.aiInsight}</p>
                </div>
                <Badge variant={l.status === "QUALIFIED" ? "success" : "default"}>{l.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
