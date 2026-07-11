"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { RowActionsMenu } from "@/components/dashboard/row-actions-menu";
import { DeleteConfirmButton } from "@/components/dashboard/delete-confirm-button";

import { InvoiceFormDialog } from "./invoice-form-dialog";
import { deleteInvoice } from "./actions";

interface Invoice {
  id: string;
  number: string;
  customerId: string;
  amount: number;
  status: string;
  dueDate: Date;
}

export function InvoiceRowActions({
  invoice,
  customers,
}: {
  invoice: Invoice;
  customers: { id: string; name: string }[];
}) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <RowActionsMenu>
        <DropdownMenuItem onSelect={() => setEditOpen(true)}>
          <Pencil className="size-4" />
          Edit
        </DropdownMenuItem>
        <DeleteConfirmButton
          entityLabel="Invoice"
          entityName={invoice.number}
          action={() => deleteInvoice(invoice.id)}
        />
      </RowActionsMenu>
      <InvoiceFormDialog
        mode="edit"
        invoice={invoice}
        customers={customers}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
