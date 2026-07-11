import { Users, Plus } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";

import { CustomerFormDialog } from "./customer-form-dialog";
import { CustomerRowActions } from "./customer-row-actions";

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">CRM</h1>
          <p className="text-sm text-muted-foreground">
            Every customer with contact info, purchase history, and an AI-generated summary.
          </p>
        </div>
        <CustomerFormDialog
          mode="create"
          trigger={
            <Button>
              <Plus className="size-4" />
              Add customer
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Customers ({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Add your first customer to start building your CRM."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Purchases</TableHead>
                  <TableHead>Lifetime Value</TableHead>
                  <TableHead>AI Summary</TableHead>
                  <TableHead className="w-10" />
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
                      <TableCell>
                        <CustomerRowActions
                          customer={{ id: c.id, name: c.name, email: c.email, phone: c.phone, notes: c.notes }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
