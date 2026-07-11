"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { RowActionsMenu } from "@/components/dashboard/row-actions-menu";
import { DeleteConfirmButton } from "@/components/dashboard/delete-confirm-button";

import { LeadFormDialog } from "./lead-form-dialog";
import { deleteLead } from "./actions";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  status: string;
  assignedToId: string | null;
}

export function LeadRowActions({ lead, users }: { lead: Lead; users: { id: string; name: string }[] }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <RowActionsMenu>
        <DropdownMenuItem onSelect={() => setEditOpen(true)}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DeleteConfirmButton entityLabel="Lead" entityName={lead.name} action={() => deleteLead(lead.id)} />
      </RowActionsMenu>
      <LeadFormDialog mode="edit" lead={lead} users={users} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
