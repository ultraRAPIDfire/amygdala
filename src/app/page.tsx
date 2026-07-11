import Link from "next/link";
import {
  Brain,
  MessageSquare,
  CalendarClock,
  Users,
  Mail,
  FileText,
  BookOpen,
  Target,
  TrendingUp,
  Receipt,
  BarChart3,
  ArrowRight,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LeadForm } from "@/components/marketing/lead-form";
import { CustomerChatWidget } from "@/components/marketing/customer-chat-widget";

const modules = [
  { icon: MessageSquare, title: "AI Customer Chat", desc: "Answers product, pricing, and booking questions instantly — escalates to staff only when it can't." },
  { icon: CalendarClock, title: "Appointment Booking", desc: "Books online, syncs to your calendar, sends confirmations, reminders, and follow-ups automatically." },
  { icon: Users, title: "CRM", desc: "Every customer's history, purchases, and an AI-written summary in one place." },
  { icon: Mail, title: "Email AI", desc: "Classifies inbound email, drafts a reply, and waits for staff approval before sending." },
  { icon: FileText, title: "AI Document Generator", desc: "Generates quotations, invoices, contracts, receipts, and proposals as PDFs — sent automatically." },
  { icon: BookOpen, title: "AI Knowledge Base", desc: "Upload manuals and policies; the AI answers customer questions using RAG." },
  { icon: Target, title: "Lead Capture", desc: "Every form fill is validated, stored, and routed to the right salesperson automatically." },
  { icon: TrendingUp, title: "AI Sales Agent", desc: "Flags who's likely to buy next based on behavior, purchase history, and abandoned carts." },
  { icon: Receipt, title: "Invoice Automation", desc: "Chases overdue invoices with reminders and escalations so you don't have to." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Revenue, conversations, appointment conversion, and hours automation has saved — at a glance." },
];

const workflowSteps = [
  "Website form submitted",
  "n8n validates & AI categorizes",
  "Saved to database + CRM",
  "Slack notification sent",
  "Welcome email delivered",
  "Follow-up scheduled",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Brain className="size-4.5" />
            </div>
            <span className="text-lg font-semibold">Amygdala</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="#modules">Modules</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#demo">Request a demo</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <p className="mx-auto mb-4 inline-block rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          AI Business Operations Hub
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Run your business on <span className="text-primary">autopilot</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Amygdala automates how small businesses handle customers, appointments, emails, documents,
          invoices, CRM, and analytics — powered by AI agents and n8n workflows.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/login">
              See the dashboard <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#demo">Request a demo</Link>
          </Button>
        </div>
      </section>

      <section id="modules" className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Every module, one hub</h2>
          <p className="mt-2 text-muted-foreground">
            Ten AI-powered modules that replace hours of manual work every day.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Card key={m.title}>
              <CardContent className="p-5">
                <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <m.icon className="size-4.5" />
                </div>
                <h3 className="font-medium">{m.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="mb-8 flex items-center justify-center gap-2 text-center">
            <Workflow className="size-5 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">How lead capture flows</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {workflowSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-border bg-background px-3 py-1.5 text-sm">
                  {step}
                </span>
                {i < workflowSteps.length - 1 && (
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Submit the form below and watch it happen for real — it writes to Postgres and fires an
            n8n webhook.
          </p>
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-lg px-6 py-16">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Request a demo</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This form is wired to the real lead-capture pipeline described above.
          </p>
        </div>
        <LeadForm />
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          Amygdala — AI Business Operations Hub. Built with Next.js, Prisma, and n8n.
        </div>
      </footer>

      <CustomerChatWidget />
    </div>
  );
}
