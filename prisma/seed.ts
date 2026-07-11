import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const org = await prisma.organization.upsert({
    where: { slug: "acme-co" },
    update: {},
    create: { name: "Acme & Co.", slug: "acme-co" },
  });

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@acme.co" },
    update: {},
    create: {
      organizationId: org.id,
      name: "Alex Rivera",
      email: "admin@acme.co",
      passwordHash,
      role: "ADMIN",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@acme.co" },
    update: {},
    create: {
      organizationId: org.id,
      name: "Sam Chen",
      email: "staff@acme.co",
      passwordHash,
      role: "STAFF",
    },
  });

  const customerData = [
    { name: "John Whitfield", email: "john.w@example.com", phone: "555-0101", aiSummary: "John usually buys laptops every 6 months. High lifetime value." },
    { name: "Priya Nair", email: "priya.n@example.com", phone: "555-0102", aiSummary: "Prefers email over calls. Frequently asks about bulk discounts." },
    { name: "Marcus Ellison", email: "marcus.e@example.com", phone: "555-0103", aiSummary: "New customer, first purchase last week." },
    { name: "Sofia Delgado", email: "sofia.d@example.com", phone: "555-0104", aiSummary: "Loyal customer since 2022. Refers friends often." },
    { name: "Tom Baker", email: "tom.b@example.com", phone: "555-0105", aiSummary: "Abandoned cart twice this month — likely price-sensitive." },
  ];

  const customers = [];
  for (const c of customerData) {
    const customer = await prisma.customer.create({ data: { organizationId: org.id, ...c } });
    customers.push(customer);
  }

  await prisma.purchase.createMany({
    data: [
      { customerId: customers[0].id, item: "ProBook Laptop", amount: 1299.0 },
      { customerId: customers[0].id, item: "Wireless Mouse", amount: 39.99 },
      { customerId: customers[1].id, item: "Bulk Order — 20x Monitor Stand", amount: 899.0 },
      { customerId: customers[3].id, item: "Annual Support Plan", amount: 499.0 },
    ],
  });

  const now = new Date();
  const inDays = (d: number) => new Date(now.getTime() + d * 86400000);

  await prisma.appointment.createMany({
    data: [
      { organizationId: org.id, customerId: customers[0].id, title: "Product consultation", startsAt: inDays(0.2), status: "CONFIRMED" },
      { organizationId: org.id, customerId: customers[2].id, title: "Onboarding call", startsAt: inDays(0.5), status: "PENDING" },
      { organizationId: org.id, customerId: customers[3].id, title: "Renewal review", startsAt: inDays(1), status: "CONFIRMED" },
      { organizationId: org.id, customerId: customers[1].id, title: "Bulk order walkthrough", startsAt: inDays(-1), status: "COMPLETED" },
    ],
  });

  await prisma.lead.createMany({
    data: [
      { organizationId: org.id, name: "Derek Holm", email: "derek@newco.com", source: "Website Form", status: "NEW", aiInsight: "Downloaded pricing PDF twice — high intent." },
      { organizationId: org.id, name: "Nina Patel", email: "nina@growthlab.io", source: "Referral", status: "CONTACTED", assignedToId: staff.id, aiInsight: "Asked about enterprise tier features." },
      { organizationId: org.id, name: "Chris Osei", email: "chris.o@retailplus.com", source: "LinkedIn Ad", status: "QUALIFIED", assignedToId: admin.id, aiInsight: "Budget confirmed, decision maker." },
      { organizationId: org.id, name: "Lena Fischer", email: "lena@fischerdesign.de", source: "Website Form", status: "NEW", aiInsight: "Likely to buy Product A based on browsing behavior." },
    ],
  });

  await prisma.invoice.createMany({
    data: [
      { organizationId: org.id, customerId: customers[0].id, number: "INV-1001", amount: 1299.0, status: "PAID", dueDate: inDays(-10) },
      { organizationId: org.id, customerId: customers[1].id, number: "INV-1002", amount: 899.0, status: "SENT", dueDate: inDays(5) },
      { organizationId: org.id, customerId: customers[3].id, number: "INV-1003", amount: 499.0, status: "OVERDUE", dueDate: inDays(-3) },
      { organizationId: org.id, customerId: customers[4].id, number: "INV-1004", amount: 210.5, status: "DRAFT", dueDate: inDays(14) },
    ],
  });

  const convo1 = await prisma.conversation.create({
    data: { organizationId: org.id, customerName: "Website Visitor #4821", channel: "web", resolvedByAi: true },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: convo1.id, role: "customer", content: "Do you have the ProBook Laptop in stock?" },
      { conversationId: convo1.id, role: "ai", content: "Yes! The ProBook Laptop is in stock and ships within 2 business days. Would you like help placing an order?" },
    ],
  });

  const convo2 = await prisma.conversation.create({
    data: { organizationId: org.id, customerName: "Website Visitor #4830", channel: "web", resolvedByAi: false },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: convo2.id, role: "customer", content: "Can I get a custom bulk pricing quote for 500 units?" },
      { conversationId: convo2.id, role: "ai", content: "I've forwarded this to our sales team since it needs custom pricing approval." },
    ],
  });

  await prisma.emailThread.createMany({
    data: [
      { organizationId: org.id, fromAddress: "angry.customer@example.com", subject: "Refund request for order #8842", body: "I want a refund, the product arrived damaged.", intent: "REFUND", draftReply: "We're sorry to hear that! We've issued a full refund for order #8842 and a prepaid return label has been emailed to you.", approved: false },
      { organizationId: org.id, fromAddress: "biz.partner@example.com", subject: "Partnership opportunity", body: "We'd love to explore a reseller partnership.", intent: "PARTNERSHIP", draftReply: "Thanks for reaching out! We'd love to explore this — could we schedule a call this week?", approved: true },
      { organizationId: org.id, fromAddress: "curious.buyer@example.com", subject: "Question about warranty", body: "Does the ProBook come with an extended warranty option?", intent: "INQUIRY", draftReply: "Yes, we offer a 2-year extended warranty for $89. Would you like me to add it to your order?", approved: false },
    ],
  });

  await prisma.document.createMany({
    data: [
      { organizationId: org.id, type: "invoice", title: "INV-1001 — John Whitfield" },
      { organizationId: org.id, type: "quotation", title: "Bulk Order Quote — Priya Nair" },
      { organizationId: org.id, type: "proposal", title: "Enterprise Proposal — Chris Osei" },
    ],
  });

  await prisma.knowledgeBaseArticle.createMany({
    data: [
      { organizationId: org.id, title: "Refund Policy", content: "Customers may request a refund within 30 days of purchase for unused items in original packaging." },
      { organizationId: org.id, title: "Shipping FAQ", content: "Standard shipping takes 3-5 business days. Expedited shipping is available at checkout." },
      { organizationId: org.id, title: "Warranty Terms", content: "All products include a 1-year limited warranty. Extended warranty plans are available." },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { organizationId: org.id, type: "URGENT", title: "Invoice overdue", body: "INV-1003 for Sofia Delgado is 3 days overdue." },
      { organizationId: org.id, type: "SUCCESS", title: "New lead qualified", body: "Chris Osei was marked as qualified by the AI sales agent." },
      { organizationId: org.id, type: "INFO", title: "Appointment confirmed", body: "Product consultation with John Whitfield confirmed for today." },
      { organizationId: org.id, type: "WARNING", title: "Email needs approval", body: "A refund reply draft is waiting for staff approval." },
    ],
  });

  await prisma.aiTask.createMany({
    data: [
      { organizationId: org.id, label: "Answered customer chat about laptop stock", category: "chat" },
      { organizationId: org.id, label: "Classified email as REFUND and drafted reply", category: "email" },
      { organizationId: org.id, label: "Generated invoice INV-1004", category: "document" },
      { organizationId: org.id, label: "Summarized customer purchase history for John Whitfield", category: "analytics" },
      { organizationId: org.id, label: "Sent appointment reminder SMS", category: "scheduling" },
      { organizationId: org.id, label: "Scored lead Chris Osei as high-intent", category: "analytics" },
    ],
  });

  console.log("Seed complete. Login with admin@acme.co / password123 (or staff@acme.co / password123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
