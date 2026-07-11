import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

  const leads = await prisma.lead.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { assignedTo: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lead Capture</h1>
        <p className="text-sm text-muted-foreground">
          Visitor fills form → n8n validates, stores, notifies Slack, creates CRM record, and assigns a
          salesperson automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Leads ({leads.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned to</TableHead>
                <TableHead>AI Insight</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
