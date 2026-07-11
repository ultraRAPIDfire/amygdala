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

import { createInvoice, updateInvoice } from "./actions";

interface Invoice {
  id: string;
  number: string;
  customerId: string;
  amount: number;
  status: string;
  dueDate: Date;
}

interface CustomerOption {
  id: string;
  name: string;
}

interface InvoiceFormDialogProps {
  mode: "create" | "edit";
  invoice?: Invoice;
  customers: CustomerOption[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function toDateInput(date?: Date) {
  const d = date ?? new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function InvoiceFormDialog({
  mode,
  invoice,
  customers,
  trigger,
  open,
  onOpenChange,
}: InvoiceFormDialogProps) {
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
          await createInvoice(formData);
          toast.success("Invoice added");
        } else if (invoice) {
          await updateInvoice(invoice.id, formData);
          toast.success("Invoice updated");
        }
        setDialogOpen(false);
        formRef.current?.reset();
      } catch {
        toast.error("Something went wrong — check the invoice number is unique.");
      }
    });
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add invoice" : "Edit invoice"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Create a new invoice." : "Update this invoice."}
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inv-number">Invoice number</Label>
              <Input id="inv-number" name="number" defaultValue={invoice?.number} placeholder="INV-1005" required autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-amount">Amount ($)</Label>
              <Input
                id="inv-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                defaultValue={invoice?.amount}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Customer</Label>
            <Select name="customerId" defaultValue={invoice?.customerId}>
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
              <Label htmlFor="inv-dueDate">Due date</Label>
              <Input
                id="inv-dueDate"
                name="dueDate"
                type="date"
                defaultValue={toDateInput(invoice?.dueDate)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select name="status" defaultValue={invoice?.status ?? "DRAFT"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : mode === "create" ? "Add invoice" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
