import { Bell } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "@/app/dashboard/sign-out-button";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function Topbar({
  organizationId,
  userName,
  userRole,
}: {
  organizationId: string;
  userName: string;
  userRole: string;
}) {
  const unreadCount = await prisma.notification.count({
    where: { organizationId, read: false },
  });

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="text-sm font-medium text-muted-foreground">Business AI Hub</div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-accent">
              <Avatar className="size-7">
                <AvatarFallback>{initials(userName)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block font-medium">{userName}</span>
                <span className="block text-xs text-muted-foreground capitalize">
                  {userRole.toLowerCase()}
                </span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <SignOutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
