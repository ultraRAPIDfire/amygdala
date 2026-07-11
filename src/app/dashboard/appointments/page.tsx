import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusVariant = {
  PENDING: "warning",
  CONFIRMED: "success",
  COMPLETED: "secondary",
  CANCELLED: "destructive",
  NO_SHOW: "destructive",
} as const;

export default async function AppointmentsPage() {
  const session = await auth();
  const organizationId = session!.user.organizationId;

  const appointments = await prisma.appointment.findMany({
    where: { organizationId },
    orderBy: { startsAt: "asc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
        <p className="text-sm text-muted-foreground">
          Booked online → synced to calendar → confirmation, reminder, and follow-up sent automatically by n8n.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Upcoming &amp; recent ({appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>{a.customer.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(a.startsAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[a.status]}>{a.status.replace("_", " ")}</Badge>
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
