import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { AiAssistantWidget } from "@/components/dashboard/ai-assistant-widget";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const org = await prisma.organization.findUnique({
    where: { id: session.user.organizationId },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar orgName={org?.name ?? ""} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          organizationId={session.user.organizationId}
          userName={session.user.name ?? "User"}
          userRole={session.user.role}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>

      <AiAssistantWidget />
    </div>
  );
}
