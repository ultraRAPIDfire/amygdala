import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  DRAFT: "secondary",
  SENT: "default",
  PAID: "success",
  OVERDUE: "destructive",
  CANCELLED: "secondary",
} as const;

export default async function InvoicesPage() {
  const session = await auth();
  const organizationId = session!.user.organizationId;

  const invoices = await prisma.invoice.findMany({
    where: { organizationId },
    orderBy: { dueDate: "asc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Invoice Automation</h1>
        <p className="text-sm text-muted-foreground">
          Due invoice → reminder email → reminder SMS → notify manager → auto-marked paid, via n8n.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Invoices ({invoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.number}</TableCell>
                  <TableCell>{inv.customer.name}</TableCell>
                  <TableCell>{formatCurrency(inv.amount.toString())}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(inv.dueDate)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[inv.status]}>{inv.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
