"use client";

import { useState } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatEntry {
  role: "user" | "ai";
  content: string;
}

export function AiAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [history, setHistory] = useState<ChatEntry[]>([
    { role: "ai", content: "Hi! I'm your AI assistant. Ask me about today's business." },
  ]);

  async function send() {
    const message = input.trim();
    if (!message || pending) return;

    setHistory((h) => [...h, { role: "user", content: message }]);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json().catch(() => null);
      const reply = data?.reply ?? "Something went wrong — please try again.";
      setHistory((h) => [...h, { role: "ai", content: reply }]);
    } catch {
      setHistory((h) => [
        ...h,
        { role: "ai", content: "Couldn't reach the AI assistant — please try again." },
      ]);
    } finally {
      setPending(false);
    }
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
            {pending && (
              <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Thinking…
              </div>
            )}
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
              disabled={pending}
            />
            <Button type="submit" size="icon" className="shrink-0" disabled={pending}>
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
