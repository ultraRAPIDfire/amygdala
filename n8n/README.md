# n8n workflows

Two workflows, both using your OpenAI key **only inside n8n** — the app never
sees it.

## One-time setup: OpenAI credential

1. In n8n: **Credentials → Add credential → OpenAi**.
2. Paste your OpenAI API key, save (name it anything, e.g. "OpenAI").
3. Both HTTP Request nodes below that call `api.openai.com` use
   **Authentication: Predefined Credential Type → OpenAi API** — after
   importing each workflow, open those nodes and pick this credential from
   the dropdown (credentials aren't portable across n8n instances, so this
   step can't be pre-filled by the import).

## 1. Lead capture (`lead-capture-workflow.json`)

Replaces the earlier version. New flow:

```
Webhook → Normalize Lead → AI Triage (OpenAI) → Parse AI Output
        → Update Lead in Amygdala (callback) → Notify Slack → Respond to Webhook
```

- **AI Triage (OpenAI)** — sends the lead's name/email/message to GPT-4o-mini,
  asks for strict JSON `{ insight, priority }` (priority ∈ NEW/CONTACTED/QUALIFIED).
- **Parse AI Output** — a Code node that safely parses that JSON (falls back
  to `NEW` / "AI analysis unavailable" if the model output isn't valid JSON).
- **Update Lead in Amygdala** — calls back into the app at
  `POST /api/leads/callback`. This is what fixes the "always Unassigned"
  problem: the app does least-loaded round-robin assignment across your
  team and returns who got assigned.
  - Open this node and replace `REPLACE_WITH_N8N_CALLBACK_SECRET` in the
    `x-n8n-secret` header with the real `N8N_CALLBACK_SECRET` value (ask
    Claude / check your Vercel env vars).
- **Notify Slack** — needs a Slack credential selected, or delete the node.

### Import steps

1. Workflows → **Import from File** → `lead-capture-workflow.json`.
2. If you still have the old version active, deactivate/delete it first (or
   just replace its contents by importing over it).
3. Set the OpenAI credential on **AI Triage (OpenAI)**.
4. Set the real secret on **Update Lead in Amygdala**.
5. Set/remove the Slack credential on **Notify Slack**.
6. **Activate** the workflow. The Webhook path is unchanged
   (`amygdala-lead-capture`), so `N8N_WEBHOOK_URL` in the app doesn't need
   to change.

## 2. AI Assistant (`ai-assistant-workflow.json`)

Powers the floating "AI Assistant" widget in the dashboard.

```
Webhook → Ask OpenAI → Extract Reply → Respond to Webhook
```

The app calls this webhook from `POST /api/ai/assistant` (server-side, after
attaching live stats — today's appointments, new leads, pending invoices, AI
tasks completed) and returns whatever this workflow replies with.

### Import steps

1. Workflows → **Import from File** → `ai-assistant-workflow.json`.
2. Set the OpenAI credential on **Ask OpenAI**.
3. **Activate** the workflow.
4. Copy the **Production URL** of the Webhook node (something like
   `https://n8n.srv1769884.hstgr.cloud/webhook/amygdala-ai-assistant`) and
   set it as `N8N_ASSISTANT_WEBHOOK_URL` in the app's env vars (local `.env`
   and Vercel).

While a workflow is deactivated, n8n only listens on the **Test URL**
(`/webhook-test/...`) for one request at a time — always activate before
relying on the Production URL.
