import { BookOpen } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { KbSearch } from "./kb-search";

export default async function KnowledgeBasePage() {
  const session = await auth();
  const organizationId = session!.user.organizationId;

  const articles = await prisma.knowledgeBaseArticle.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Knowledge Base</h1>
        <p className="text-sm text-muted-foreground">
          Upload manuals, policies, and FAQs — the AI answers customer questions using RAG over this
          content. This demo uses keyword matching; swap in embeddings + a vector store for production.
        </p>
      </div>

      <KbSearch articles={articles} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">
            Articles ({articles.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {articles.map((a) => (
            <div key={a.id} className="flex gap-3 rounded-md border border-border p-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <BookOpen className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.content}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
