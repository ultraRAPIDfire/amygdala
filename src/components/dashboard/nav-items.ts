import {
  LayoutDashboard,
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
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Customer Chat", href: "/dashboard/chat", icon: MessageSquare },
  { label: "Appointments", href: "/dashboard/appointments", icon: CalendarClock },
  { label: "CRM", href: "/dashboard/crm", icon: Users },
  { label: "Email AI", href: "/dashboard/email", icon: Mail },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Knowledge Base", href: "/dashboard/knowledge-base", icon: BookOpen },
  { label: "Leads", href: "/dashboard/leads", icon: Target },
  { label: "AI Sales Agent", href: "/dashboard/sales-agent", icon: TrendingUp },
  { label: "Invoices", href: "/dashboard/invoices", icon: Receipt },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];
