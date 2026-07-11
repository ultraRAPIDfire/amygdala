"use client";

import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatEntry {
  role: "user" | "ai";
  content: string;
}

const CANNED_REPLIES: Record<string, string> = {
  default:
    "I can help summarize customers, draft follow-up emails, or check today's schedule. This assistant is a UI preview — connect it to OpenAI via the /api/ai route to make it live.",
};

export function AiAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatEntry[]>([
    { role: "ai", content: "Hi! I'm your AI assistant. Ask me about today's business." },
  ]);

  function send() {
    if (!input.trim()) return;
    const userMsg: ChatEntry = { role: "user", content: input };
    const aiMsg: ChatEntry = { role: "ai", content: CANNED_REPLIES.default };
    setHistory((h) => [...h, userMsg, aiMsg]);
    setInput("");
  }

  return (
    <div className="fixed right-5 bottom-5 z-40">
      {open && (
        <div className="mb-3 flex h-96 w-80 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="size-4 text-primary" />
              AI Assistant
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <X className="size-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {history.map((entry, i) => (
              <div
                key={i}
                className={
                  entry.role === "user"
                    ? "ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "mr-auto max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm"
                }
              >
                {entry.content}
              </div>
            ))}
          </div>

          <form
            className="flex items-center gap-2 border-t border-border p-2"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the AI assistant…"
              className="h-9"
            />
            <Button type="submit" size="icon" className="shrink-0">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}

      <Button
        size="icon"
        className="size-12 rounded-full shadow-lg"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle AI assistant"
      >
        <Sparkles className="size-5" />
      </Button>
    </div>
  );
}
