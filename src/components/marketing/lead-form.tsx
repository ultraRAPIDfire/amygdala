"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LeadForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || undefined,
      message: formData.get("message") || undefined,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-success/30 bg-success/10 p-6 text-center">
        <p className="font-medium text-success">Thanks! Our AI has logged your request.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          It just flowed through the same lead-capture automation described above — n8n webhook, CRM
          record, and notification, all triggered by this form.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Jane Doe" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required placeholder="jane@company.com" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input id="phone" name="phone" placeholder="555-0100" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">What do you need help automating?</Label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          placeholder="e.g. appointment scheduling, invoice reminders…"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-destructive">Something went wrong — please try again.</p>
      )}

      <Button type="submit" className="w-full" disabled={status === "loading"}>
        {status === "loading" ? "Submitting…" : "Request a demo"}
      </Button>
    </form>
  );
}
