import { CalendarClock, Plus } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";

import { AppointmentFormDialog } from "./appointment-form-dialog";
import { AppointmentRowActions } from "./appointment-row-actions";

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

  const [appointments, customers] = await Promise.all([
    prisma.appointment.findMany({
      where: { organizationId },
      orderBy: { startsAt: "asc" },
      include: { customer: true },
    }),
    prisma.customer.findMany({ where: { organizationId }, select: { id: true, name: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
          <p className="text-sm text-muted-foreground">
            Booked online → synced to calendar → confirmation, reminder, and follow-up sent automatically by n8n.
          </p>
        </div>
        <AppointmentFormDialog
          mode="create"
          customers={customers}
          trigger={
            <Button disabled={customers.length === 0}>
              <Plus className="size-4" />
              Add appointment
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Upcoming &amp; recent ({appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No appointments yet"
              description={
                customers.length === 0
                  ? "Add a customer first, then schedule an appointment for them."
                  : "Schedule your first appointment."
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
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
                    <TableCell>
                      <AppointmentRowActions
                        appointment={{
                          id: a.id,
                          title: a.title,
                          customerId: a.customerId,
                          startsAt: a.startsAt,
                          status: a.status,
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
