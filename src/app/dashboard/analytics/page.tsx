import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessagesSquare, Clock, Sparkles } from "lucide-react";

import { RevenueTrendChart, AppointmentStatusChart } from "./charts";

function seededTrend(seedTotal: number) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  let seed = seedTotal || 1000;
  return days.map((day) => {
    seed = (seed * 9301 + 49297) % 233280;
    const noise = seed / 233280;
    return { day, revenue: Math.round(200 + noise * (seedTotal || 500)) };
  });
}

export default async function AnalyticsPage() {
  const session = await auth();
  const organizationId = session!.user.organizationId;

  const [customerCount, conversations, appointmentsByStatus, aiTaskCount, purchases] = await Promise.all([
    prisma.customer.count({ where: { organizationId } }),
    prisma.conversation.findMany({ where: { organizationId } }),
    prisma.appointment.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: { _all: true },
    }),
    prisma.aiTask.count({ where: { organizationId } }),
    prisma.purchase.findMany({ where: { customer: { organizationId } } }),
  ]);

  const totalRevenue = purchases.reduce((s, p) => s + Number(p.amount), 0);
  const resolvedByAi = conversations.filter((c) => c.resolvedByAi).length;
  const aiResolutionRate = conversations.length
    ? Math.round((resolvedByAi / conversations.length) * 100)
    : 0;

  const appointmentData = appointmentsByStatus.map((a) => ({
    status: a.status.replace("_", " "),
    count: a._count._all,
  }));

  const revenueTrend = seededTrend(totalRevenue);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Revenue, customers, AI conversations, appointment conversion, and hours automation has saved.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Customers" value={String(customerCount)} icon={Users} />
        <StatCard
          label="AI Conversations"
          value={String(conversations.length)}
          icon={MessagesSquare}
          hint={`${aiResolutionRate}% resolved by AI`}
        />
        <StatCard
          label="AI Tasks Completed"
          value={String(aiTaskCount)}
          icon={Sparkles}
          accent="default"
        />
        <StatCard
          label="Est. Hours Saved"
          value={`${(aiTaskCount * 0.25).toFixed(1)}h`}
          icon={Clock}
          accent="success"
          hint="~15 min saved per automated task"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Revenue trend (illustrative)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueTrendChart data={revenueTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">
              Appointment conversion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AppointmentStatusChart data={appointmentData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
