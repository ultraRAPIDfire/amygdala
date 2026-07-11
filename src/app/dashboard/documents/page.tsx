import { FileText } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DocumentsPage() {
  const session = await auth();
  const organizationId = session!.user.organizationId;

  const documents = await prisma.document.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Document Generator</h1>
        <p className="text-sm text-muted-foreground">
          Quotations, invoices, contracts, receipts, and proposals — generated as PDFs and emailed
          automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Generated documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {documents.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">{d.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(d.createdAt)}</p>
                </div>
              </div>
              <Badge variant="secondary" className="capitalize">
                {d.type}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
