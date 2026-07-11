import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function CrmPage() {
  const session = await auth();
  const organizationId = session!.user.organizationId;

  const customers = await prisma.customer.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { purchases: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">CRM</h1>
        <p className="text-sm text-muted-foreground">
          Every customer with contact info, purchase history, and an AI-generated summary.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Customers ({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Purchases</TableHead>
                <TableHead>Lifetime Value</TableHead>
                <TableHead>AI Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => {
                const ltv = c.purchases.reduce((sum, p) => sum + Number(p.amount), 0);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div>{c.email}</div>
                      <div>{c.phone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{c.purchases.length}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(ltv)}</TableCell>
                    <TableCell className="max-w-xs text-sm text-muted-foreground">
                      {c.aiSummary}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
