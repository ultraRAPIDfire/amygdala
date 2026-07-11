"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";

import { approveEmailReply } from "./actions";

export function ApproveButton({ emailId }: { emailId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() => startTransition(() => approveEmailReply(emailId))}
    >
      <Check className="size-3.5" />
      {pending ? "Approving…" : "Approve & Send"}
    </Button>
  );
}
