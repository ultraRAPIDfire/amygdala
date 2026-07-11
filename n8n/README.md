# n8n workflow

One workflow, two independent triggers, both using your OpenAI key **only
inside n8n** — the app never sees it.

## Delete anything you already imported

If you previously imported `lead-capture-workflow.json` and/or
`ai-assistant-workflow.json`, delete those workflows in n8n first so you
don't end up with duplicate/conflicting webhook paths. Then import
`amygdala-workflow.json` fresh — it replaces both.

## One-time setup: OpenAI credential

1. In n8n: **Credentials → Add credential → OpenAi**.
2. Paste your OpenAI API key, save (name it anything, e.g. "OpenAI").
3. Both HTTP Request nodes that call `api.openai.com` — **AI Triage (OpenAI)**
   and **Ask OpenAI (Assistant)** — use **Authentication: Predefined
   Credential Type → OpenAi API**. After import, open each node and pick this
   credential from the dropdown (credentials aren't portable across n8n
   instances, so this step can't be pre-filled by the import).

## Import `amygdala-workflow.json`

Workflows → **Import from URL** (or **Import from File** / paste JSON onto
the canvas):

```
https://raw.githubusercontent.com/ultraRAPIDfire/amygdala/main/n8n/amygdala-workflow.json
```

This creates one workflow, **Amygdala - AI Workflows**, with two branches:

### Branch A — Lead capture (webhook path `amygdala-lead-capture`)

```
Lead Webhook → Normalize Lead → AI Triage (OpenAI) → Parse AI Output
             → Update Lead in Amygdala (callback) → Notify Slack → Respond to Lead Webhook
```

- **AI Triage (OpenAI)** — sends the lead's name/email/message to GPT-4o-mini,
  asks for strict JSON `{ insight, priority }`.
- **Parse AI Output** — Code node that safely parses that JSON (falls back
  to `NEW` / "AI analysis unavailable" if parsing fails).
- **Update Lead in Amygdala** — calls `POST /api/leads/callback` in the app,
  which does least-loaded round-robin assignment across your team. Open this
  node and replace `REPLACE_WITH_N8N_CALLBACK_SECRET` in the `x-n8n-secret`
  header with the real secret (matches `N8N_CALLBACK_SECRET` in Vercel).
- **Notify Slack** — needs a Slack credential selected, or delete the node.

### Branch B — AI Assistant (webhook path `amygdala-ai-assistant`)

```
Assistant Webhook → Ask OpenAI (Assistant) → Extract Reply → Respond to Assistant Webhook
```

Powers the floating "AI Assistant" widget in the dashboard. The app calls
this from `POST /api/ai/assistant` with the user's message plus live business
stats, and returns whatever this branch replies with.

## After configuring both branches

1. **Activate** the workflow (one toggle covers both branches/webhooks).
2. Open **Lead Webhook** → copy its Production URL → set as `N8N_WEBHOOK_URL`
   in Vercel:
   ```
   https://n8n.srv1769884.hstgr.cloud/webhook/amygdala-lead-capture
   ```
3. Open **Assistant Webhook** → copy its Production URL → set as
   `N8N_ASSISTANT_WEBHOOK_URL` in Vercel:
   ```
   https://n8n.srv1769884.hstgr.cloud/webhook/amygdala-ai-assistant
   ```
4. These two URLs must be **different** (different path at the end). Redeploy
   in Vercel after setting them.

While a workflow is deactivated, n8n only listens on the **Test URL**
(`/webhook-test/...`) for one request at a time — always activate before
relying on the Production URL.
