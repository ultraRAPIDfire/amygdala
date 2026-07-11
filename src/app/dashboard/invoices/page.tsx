import { Receipt, Plus } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";

import { InvoiceFormDialog } from "./invoice-form-dialog";
import { InvoiceRowActions } from "./invoice-row-actions";

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

  const [invoices, customers] = await Promise.all([
    prisma.invoice.findMany({
      where: { organizationId },
      orderBy: { dueDate: "asc" },
      include: { customer: true },
    }),
    prisma.customer.findMany({ where: { organizationId }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invoice Automation</h1>
          <p className="text-sm text-muted-foreground">
            Due invoice → reminder email → reminder SMS → notify manager → auto-marked paid, via n8n.
          </p>
        </div>
        <InvoiceFormDialog
          mode="create"
          customers={customers}
          trigger={
            <Button disabled={customers.length === 0}>
              <Plus className="size-4" />
              Add invoice
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Invoices ({invoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No invoices yet"
              description={
                customers.length === 0
                  ? "Add a customer first, then create an invoice for them."
                  : "Create your first invoice."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
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
                    <TableCell>
                      <InvoiceRowActions
                        invoice={{
                          id: inv.id,
                          number: inv.number,
                          customerId: inv.customerId,
                          amount: Number(inv.amount),
                          status: inv.status,
                          dueDate: inv.dueDate,
                        }}
                        customers={customers}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
