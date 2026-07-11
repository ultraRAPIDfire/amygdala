"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatEntry {
  role: "customer" | "ai";
  content: string;
}

const STORAGE_KEY = "amygdala_chat_conversation_id";

export function CustomerChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(() =>
    typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null
  );
  const [history, setHistory] = useState<ChatEntry[]>([
    { role: "ai", content: "Hi! Ask me anything about our products, pricing, or policies." },
  ]);

  async function send() {
    const message = input.trim();
    if (!message || pending) return;

    setHistory((h) => [...h, { role: "customer", content: message }]);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message }),
      });
      const data = await res.json().catch(() => null);

      if (data?.conversationId) {
        setConversationId(data.conversationId);
        sessionStorage.setItem(STORAGE_KEY, data.conversationId);
      }

      const reply = data?.reply ?? "Something went wrong — please try again.";
      setHistory((h) => [...h, { role: "ai", content: reply }]);
    } catch {
      setHistory((h) => [
        ...h,
        { role: "ai", content: "Couldn't reach support chat — please try again." },
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
              <MessageCircle className="size-4 text-primary" />
              Chat with us
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
                  entry.role === "customer"
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
              placeholder="Ask a question…"
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
        aria-label="Toggle customer chat"
      >
        <MessageCircle className="size-5" />
      </Button>
    </div>
  );
}
