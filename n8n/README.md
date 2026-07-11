# n8n workflows

## Lead capture (`lead-capture-workflow.json`)

Triggered by `POST /api/leads` in the app (see [src/app/api/leads/route.ts](../src/app/api/leads/route.ts)),
which sends:

```json
{
  "event": "lead.captured",
  "lead": { "id", "name", "email", "phone", "message", "organizationId", "createdAt" }
}
```

### Import into your hosted n8n

1. Open `https://n8n.srv1769884.hstgr.cloud/`.
2. Workflows → **Import from File** → select `lead-capture-workflow.json`.
3. Open the **Notify Slack** node and either add a Slack credential, or delete the node
   and wire **Normalize Lead** straight to **Respond to Webhook** if you don't use Slack yet.
4. Click **Activate** (top-right toggle) to turn the workflow on.
5. Open the **Webhook** node and copy the **Production URL** — it looks like:
   `https://n8n.srv1769884.hstgr.cloud/webhook/amygdala-lead-capture`
6. Set that URL as `N8N_WEBHOOK_URL` in `.env` (local) and in your Vercel project's
   environment variables (production).

While the workflow is deactivated, n8n only listens on the **Test URL**
(`/webhook-test/amygdala-lead-capture`) and only for one request after you click
"Listen for test event" — use the Production URL once activated for the app to work continuously.
