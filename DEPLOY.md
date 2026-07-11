# Deploying Amygdala

## 1. Database — Neon

Done: migrated and seeded against Neon.

```
DATABASE_URL="<neon-connection-string>" npx prisma migrate deploy
DATABASE_URL="<neon-connection-string>" npx prisma db seed
```

## 2. n8n workflow

Hosted at `https://n8n.srv1769884.hstgr.cloud/`. All AI calls (OpenAI) live
here, not in the app — see [`n8n/README.md`](n8n/README.md) for full setup.

One workflow, [`n8n/amygdala-workflow.json`](n8n/amygdala-workflow.json), with
two independent webhook branches:

- **Lead capture** (`amygdala-lead-capture`) — Webhook → AI triage (insight +
  priority) → calls back to `/api/leads/callback` to auto-assign a
  salesperson → Slack → respond.
- **AI Assistant** (`amygdala-ai-assistant`) — powers the dashboard's
  floating AI Assistant widget.

## 3. Vercel

1. [vercel.com/new](https://vercel.com/new) → Import Git Repository →
   `ultraRAPIDfire/amygdala`. Framework preset (Next.js) is auto-detected, no
   build command changes needed.
2. Environment Variables (Project Settings → Environment Variables):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Neon connection string |
   | `AUTH_SECRET` | random secret — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
   | `NEXTAUTH_URL` | production URL, e.g. `https://amygdala-chi.vercel.app` |
   | `N8N_WEBHOOK_URL` | Production URL of the lead-capture Webhook node |
   | `N8N_CALLBACK_SECRET` | random secret, must match the value pasted into the "Update Lead in Amygdala" node in n8n |
   | `N8N_ASSISTANT_WEBHOOK_URL` | Production URL of the AI-assistant Webhook node |

3. Deploy. `postinstall` runs `prisma generate` automatically so the Prisma
   client is (re)built on every install — no extra build config needed.
4. After the first deploy, confirm `NEXTAUTH_URL` matches the assigned
   `*.vercel.app` URL and redeploy if it changed.

## Login

Sign in with `admin@acme.co` / `password123` (or `staff@acme.co` / `password123`).
