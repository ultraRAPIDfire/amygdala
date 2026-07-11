import { Target, Plus } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";

import { LeadFormDialog } from "./lead-form-dialog";
import { LeadRowActions } from "./lead-row-actions";

const statusVariant = {
  NEW: "default",
  CONTACTED: "secondary",
  QUALIFIED: "success",
  WON: "success",
  LOST: "destructive",
} as const;

export default async function LeadsPage() {
  const session = await auth();
  const organizationId = session!.user.organizationId;

  const [leads, users] = await Promise.all([
    prisma.lead.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      include: { assignedTo: true },
    }),
    prisma.user.findMany({ where: { organizationId }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lead Capture</h1>
          <p className="text-sm text-muted-foreground">
            Visitor fills form → n8n validates, stores, notifies Slack, creates CRM record, and assigns a
            salesperson automatically.
          </p>
        </div>
        <LeadFormDialog
          mode="create"
          users={users}
          trigger={
            <Button>
              <Plus className="size-4" />
              Add lead
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Leads ({leads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No leads yet"
              description="Leads from your website form will show up here, or add one manually."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned to</TableHead>
                  <TableHead>AI Insight</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">
                      <div>{l.name}</div>
                      <div className="text-xs text-muted-foreground">{l.email}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.source}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[l.status]}>{l.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {l.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-[10px]">
                              {l.assignedTo.name
                                .split(" ")
                                .map((p) => p[0])
                                .slice(0, 2)
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{l.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs text-sm text-muted-foreground">
                      {l.aiInsight}
                    </TableCell>
                    <TableCell>
                      <LeadRowActions
                        lead={{
                          id: l.id,
                          name: l.name,
                          email: l.email,
                          phone: l.phone,
                          source: l.source,
                          status: l.status,
                          assignedToId: l.assignedToId,
                        }}
                        users={users}
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
