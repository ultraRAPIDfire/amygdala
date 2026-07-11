"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Article {
  id: string;
  title: string;
  content: string;
}

export function KbSearch({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");

  const match = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return (
      articles.find(
        (a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
      ) ?? null
    );
  }, [query, articles]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Ask a question, e.g. "What is our refund policy?"'
          className="pl-9"
        />
      </div>

      {query.trim() && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 text-sm">
            {match ? (
              <>
                <p className="mb-1 text-xs font-medium text-primary">Instant answer</p>
                <p>{match.content}</p>
              </>
            ) : (
              <p className="text-muted-foreground">
                No matching article found in the knowledge base yet.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
