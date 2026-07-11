"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { createAppointment, updateAppointment } from "./actions";

interface Appointment {
  id: string;
  title: string;
  customerId: string;
  startsAt: Date;
  status: string;
}

interface CustomerOption {
  id: string;
  name: string;
}

interface AppointmentFormDialogProps {
  mode: "create" | "edit";
  appointment?: Appointment;
  customers: CustomerOption[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function toDatetimeLocal(date?: Date) {
  const d = date ?? new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AppointmentFormDialog({
  mode,
  appointment,
  customers,
  trigger,
  open,
  onOpenChange,
}: AppointmentFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = trigger === undefined;
  const dialogOpen = isControlled ? (open ?? false) : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createAppointment(formData);
          toast.success("Appointment added");
        } else if (appointment) {
          await updateAppointment(appointment.id, formData);
          toast.success("Appointment updated");
        }
        setDialogOpen(false);
        formRef.current?.reset();
      } catch {
        toast.error("Something went wrong — please try again.");
      }
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add appointment" : "Edit appointment"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Schedule a new appointment." : "Update this appointment."}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="appt-title">Title</Label>
            <Input id="appt-title" name="title" defaultValue={appointment?.title} required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Customer</Label>
            <Select name="customerId" defaultValue={appointment?.customerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="appt-startsAt">Date &amp; time</Label>
              <Input
                id="appt-startsAt"
                name="startsAt"
                type="datetime-local"
                defaultValue={toDatetimeLocal(appointment?.startsAt)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select name="status" defaultValue={appointment?.status ?? "PENDING"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Add appointment" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
