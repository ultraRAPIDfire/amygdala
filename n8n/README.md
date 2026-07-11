# n8n workflow

One workflow, three independent triggers, all using your OpenAI key **only
inside n8n** — the app never sees it.

## Already have the workflow imported?

You already have **Amygdala - AI Workflows** open with branches A and B
working. To add branch C (customer chat) without disturbing your existing
OpenAI/Slack credential selections:

1. Open the existing workflow's canvas.
2. **⋯** menu → **Import from URL** (same as before) → paste the URL below.
   Re-importing into an already-open workflow adds the new nodes alongside
   the existing ones (branch A/B nodes keep their IDs, so their credentials
   should be preserved).
3. If that doesn't merge cleanly, delete the workflow and re-import fresh —
   you'll just need to reselect credentials on all nodes again.

## One-time setup: OpenAI credential

1. In n8n: **Credentials → Add credential → OpenAi**.
2. Paste your OpenAI API key, save (name it anything, e.g. "OpenAI").
3. Every HTTP Request node that calls `api.openai.com` — **AI Triage
   (OpenAI)**, **Ask OpenAI (Assistant)**, **Ask OpenAI (Chat)** — uses
   **Authentication: Predefined Credential Type → OpenAi API**. After import,
   open each node and pick this credential from the dropdown (credentials
   aren't portable across n8n instances, so this can't be pre-filled).

## Import `amygdala-workflow.json`

```
https://raw.githubusercontent.com/ultraRAPIDfire/amygdala/main/n8n/amygdala-workflow.json
```

One workflow, **Amygdala - AI Workflows**, with three branches:

### Branch A — Lead capture (webhook path `amygdala-lead-capture`)

```
Lead Webhook → Normalize Lead → AI Triage (OpenAI) → Parse AI Output
             → Update Lead in Amygdala (callback) → Notify Slack → Respond to Lead Webhook
```

- **AI Triage (OpenAI)** — sends the lead's name/email/message to GPT-4o-mini,
  asks for strict JSON `{ insight, priority }`.
- **Update Lead in Amygdala** — calls `POST /api/leads/callback`, which does
  least-loaded round-robin assignment across your team. The `x-n8n-secret`
  header must match `N8N_CALLBACK_SECRET` in Vercel.
- **Notify Slack** — needs a Slack credential selected, or delete the node.

### Branch B — AI Assistant (webhook path `amygdala-ai-assistant`)

```
Assistant Webhook → Ask OpenAI (Assistant) → Extract Reply → Respond to Assistant Webhook
```

Powers the floating "AI Assistant" widget in the dashboard (internal,
staff-facing — answers questions using live business stats).

### Branch C — Customer chat (webhook path `amygdala-customer-chat`)

```
Chat Webhook → Normalize Chat → Ask OpenAI (Chat) → Parse Chat Output
             → Needs Escalation? → Notify Staff (if escalated) → Respond to Chat Webhook
```

Powers the **public** chat widget on the marketing page (bottom-left bubble).
The app (`POST /api/chat`) sends the visitor's message plus your Knowledge
Base articles as context. The AI is instructed to answer **only** from that
context and to reply with strict JSON `{ reply, escalate }` — if it can't
answer confidently, `escalate: true` is returned, the app marks the
conversation as needing a human (visible on the dashboard's "AI Customer
Chat" page), and this branch also pings Slack.

- **Needs Escalation?** — an IF node routing on `escalate`.
- **Notify Staff** — needs a Slack credential and a `#support` channel (or
  edit the channel name). Delete the node if you don't use Slack; the app
  will still mark the conversation as escalated either way.

## After configuring all branches

1. **Activate** the workflow (one toggle covers all three webhooks).
2. Copy each Webhook node's Production URL into the matching Vercel env var
   — they must all be **different** (different path at the end):

   | Webhook node | Vercel env var |
   |---|---|
   | Lead Webhook | `N8N_WEBHOOK_URL` |
   | Assistant Webhook | `N8N_ASSISTANT_WEBHOOK_URL` |
   | Chat Webhook | `N8N_CHAT_WEBHOOK_URL` |

3. Redeploy in Vercel after setting them.

While a workflow is deactivated, n8n only listens on the **Test URL**
(`/webhook-test/...`) for one request at a time — always activate before
relying on the Production URL.
