# מאזן חודשי — Cash Flow Tracker

Personal monthly cash flow tracker built with Next.js 14, Prisma, SQLite, Recharts.

## Local Development

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Railway Deployment

1. Push repo to GitHub.
2. Create new Railway project → Deploy from GitHub repo.
3. Add environment variable: `DATABASE_URL` (Railway provides a Postgres URL, or use SQLite with a volume mount).
4. Railway runs: `npx prisma migrate deploy && npm run start`

## Home-hub sync

Shared household expenses are entered in home-hub only. home-hub pushes this user's half of each one to
`POST /api/integrations/home-hub`, which creates, updates or deletes the matching transaction (stored with
`source = "home-hub"` and the home-hub expense id as `externalId`, so a re-send never duplicates).

Environment variables:

- `HOME_HUB_SYNC_KEY` — shared secret, sent by home-hub as `Authorization: Bearer <key>`. Without it the endpoint rejects everything.
- `HOME_HUB_SYNC_USER` — the name of the user the expenses belong to. Optional while there is exactly one user.

Request body: `{ upserts: [{ externalId, date: "yyyy-mm-dd", category, description, amount }], deletes: [externalId], dedupe?: boolean }`.
With `dedupe: true` (used for the one-time import) an expense is skipped, and reported back, if a transaction entered
by hand already exists on the same day with the same amount.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/transactions?month=6&year=2026` | List transactions for month |
| POST | `/api/transactions` | Create transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/health` | Health check — `{ status: "ok", app: "cash-flow" }` |
| GET | `/api/summary` | Current month summary (netBalance, totalIncome, totalExpenses) |
