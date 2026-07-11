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
import { Textarea } from "@/components/ui/textarea";

import { createCustomer, updateCustomer } from "./actions";

interface CustomerFormDialogProps {
  mode: "create" | "edit";
  customer?: { id: string; name: string; email: string | null; phone: string | null; notes: string | null };
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CustomerFormDialog({ mode, customer, trigger, open, onOpenChange }: CustomerFormDialogProps) {
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
          await createCustomer(formData);
          toast.success("Customer added");
        } else if (customer) {
          await updateCustomer(customer.id, formData);
          toast.success("Customer updated");
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
          <DialogTitle>{mode === "create" ? "Add customer" : "Edit customer"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new customer to your CRM."
              : "Update this customer's details."}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="customer-name">Name</Label>
            <Input id="customer-name" name="name" defaultValue={customer?.name} required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="customer-email">Email</Label>
              <Input id="customer-email" name="email" type="email" defaultValue={customer?.email ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer-phone">Phone</Label>
              <Input id="customer-phone" name="phone" defaultValue={customer?.phone ?? ""} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="customer-notes">Notes</Label>
            <Textarea id="customer-notes" name="notes" defaultValue={customer?.notes ?? ""} rows={3} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Add customer" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
