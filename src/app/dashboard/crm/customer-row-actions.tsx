"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { RowActionsMenu } from "@/components/dashboard/row-actions-menu";
import { DeleteConfirmButton } from "@/components/dashboard/delete-confirm-button";

import { CustomerFormDialog } from "./customer-form-dialog";
import { deleteCustomer } from "./actions";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
}

export function CustomerRowActions({ customer }: { customer: Customer }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <RowActionsMenu>
        <DropdownMenuItem onSelect={() => setEditOpen(true)}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DeleteConfirmButton
          entityLabel="Customer"
          entityName={customer.name}
          action={() => deleteCustomer(customer.id)}
        />
      </RowActionsMenu>
      <CustomerFormDialog mode="edit" customer={customer} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
