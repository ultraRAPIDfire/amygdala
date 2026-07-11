# Deploying Amygdala

## 1. Database — Neon

1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the pooled connection string (looks like
   `postgresql://user:pass@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require`).
3. Send it to me (or run these yourself) so we can apply the schema and seed demo data:
   ```
   DATABASE_URL="<neon-connection-string>" npx prisma migrate deploy
   DATABASE_URL="<neon-connection-string>" npx prisma db seed
   ```

## 2. n8n webhook

Already hosted at `https://n8n.srv1769884.hstgr.cloud/`. Import
[`n8n/lead-capture-workflow.json`](n8n/lead-capture-workflow.json) — see
[`n8n/README.md`](n8n/README.md) for the exact steps and how to get the
Production Webhook URL.

## 3. Vercel

1. [vercel.com/new](https://vercel.com/new) → Import Git Repository →
   `ultraRAPIDfire/amygdala`. Framework preset (Next.js) is auto-detected, no
   build command changes needed.
2. Add these Environment Variables (Project Settings → Environment Variables):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | your Neon connection string |
   | `AUTH_SECRET` | a random secret — generate with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
   | `NEXTAUTH_URL` | your Vercel production URL, e.g. `https://amygdala.vercel.app` (set after first deploy, then redeploy) |
   | `OPENAI_API_KEY` | leave blank for now — nothing calls it yet |
   | `N8N_WEBHOOK_URL` | the Production URL from the n8n Webhook node |

3. Deploy. `postinstall` runs `prisma generate` automatically so the Prisma
   client is (re)built on every install — no extra build config needed.
4. After the first deploy, copy the assigned `*.vercel.app` URL into
   `NEXTAUTH_URL` and redeploy (Auth.js needs to know its own canonical URL).

## Login

Once seeded, sign in with `admin@acme.co` / `password123` (or
`staff@acme.co` / `password123`).
