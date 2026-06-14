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

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/transactions?month=6&year=2026` | List transactions for month |
| POST | `/api/transactions` | Create transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/health` | Health check — `{ status: "ok", app: "cash-flow" }` |
| GET | `/api/summary` | Current month summary (netBalance, totalIncome, totalExpenses) |
