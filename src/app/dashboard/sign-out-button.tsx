"use client";

import { LogOut } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { signOutAction } from "./actions";

export function SignOutButton() {
  return (
    <DropdownMenuItem onSelect={() => signOutAction()}>
      <LogOut className="size-4" />
      Sign out
    </DropdownMenuItem>
  );
}
