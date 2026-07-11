"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { RowActionsMenu } from "@/components/dashboard/row-actions-menu";
import { DeleteConfirmButton } from "@/components/dashboard/delete-confirm-button";

import { AppointmentFormDialog } from "./appointment-form-dialog";
import { deleteAppointment } from "./actions";

interface Appointment {
  id: string;
  title: string;
  customerId: string;
  startsAt: Date;
  status: string;
}

export function AppointmentRowActions({
  appointment,
  customers,
}: {
  appointment: Appointment;
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
          entityLabel="Appointment"
          entityName={appointment.title}
          action={() => deleteAppointment(appointment.id)}
        />
      </RowActionsMenu>
      <AppointmentFormDialog
        mode="edit"
        appointment={appointment}
        customers={customers}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
