import { DollarSign, CalendarClock, Target, Sparkles, Receipt } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

const notificationVariant = {
  URGENT: "destructive",
  WARNING: "warning",
  SUCCESS: "success",
  INFO: "outline",
} as const;

export default async function DashboardOverviewPage() {
  const session = await auth();
  const organizationId = session!.user.organizationId;

  const [todaysSales, todaysAppointments, newLeads, aiTasksToday, pendingInvoices, recentCustomers, notifications] =
    await Promise.all([
      prisma.purchase.aggregate({
        _sum: { amount: true },
        where: {
          customer: { organizationId },
          createdAt: { gte: startOfToday(), lte: endOfToday() },
        },
      }),
      prisma.appointment.count({
        where: { organizationId, startsAt: { gte: startOfToday(), lte: endOfToday() } },
      }),
      prisma.lead.count({ where: { organizationId, status: "NEW" } }),
      prisma.aiTask.count({
        where: { organizationId, completedAt: { gte: startOfToday(), lte: endOfToday() } },
      }),
      prisma.invoice.count({
        where: { organizationId, status: { in: ["SENT", "OVERDUE", "DRAFT"] } },
      }),
      prisma.customer.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.notification.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const salesTotal = todaysSales._sum.amount ? Number(todaysSales._sum.amount) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          What&apos;s happening across your business today.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Today's Sales"
          value={`$${salesTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
          accent="success"
        />
        <StatCard label="Today's Appointments" value={String(todaysAppointments)} icon={CalendarClock} />
        <StatCard label="New Leads" value={String(newLeads)} icon={Target} />
        <StatCard label="AI Tasks Completed" value={String(aiTasksToday)} icon={Sparkles} accent="default" />
        <StatCard
          label="Pending Invoices"
          value={String(pendingInvoices)}
          icon={Receipt}
          accent={pendingInvoices > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Recent Customers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentCustomers.map((c) => (
              <div key={c.id} className="flex items-start gap-3 rounded-md border border-border p-3">
                <Avatar>
                  <AvatarFallback>
                    {c.name
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{c.email}</span>
                  </div>
                  {c.aiSummary && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.aiSummary}</p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="space-y-1 rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  <Badge variant={notificationVariant[n.type]}>{n.type.toLowerCase()}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{n.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
