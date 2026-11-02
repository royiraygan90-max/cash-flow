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

Request body: `{ upserts: [{ externalId, date: "yyyy-mm-dd", category, description, amount }], deletes: [externalId], dedupe?: boolean, shifts?: { from, to, items } }`.
With `dedupe: true` (used for the one-time import) an expense is skipped, and reported back, if a transaction entered
by hand already exists on the same day with the same amount.

Work shifts come the same way, from home-hub's calendar. `shifts` is a whole window of days
(`from` inclusive, `to` exclusive) with every shift home-hub has in it: `{ externalId, date, startTime: "HH:MM", endTime: "HH:MM" }`.
The window is reconciled: shifts are created or updated (hours, Shabbat hours and pay are worked out here, exactly as for a shift
added by hand), and synced shifts in the window that are no longer listed are removed. Shifts entered by hand are never touched,
and a listed shift with the same day and hours as one entered by hand is skipped and reported, not counted twice. They show a
"מהבית" badge in the shift list.

## Card-charge SMS

An iOS Shortcut forwards each "אושרה עסקה" SMS from the card issuer to `POST /api/integrations/sms`, which adds it as an
expense (`source = "sms"`, shown with an "אשראי" badge). Setup steps for the phone: [docs/sms-shortcut.md](docs/sms-shortcut.md).

Environment variables: `SMS_SYNC_KEY` — shared secret, sent as `Authorization: Bearer <key>`. Without it the endpoint rejects
everything. `SMS_SYNC_USER` — the name of the user the expenses belong to (falls back to `HOME_HUB_SYNC_USER`). Required when there is more than one user.

Request body: `{ text, receivedAt? }` — `text` is the raw message, parsed here so a change in wording is fixed on the server, not on the phone.
`receivedAt` is any string that differs per message (the Shortcut sends the message's date and time); it lets two identical
purchases on one day stay apart, while re-sending the same message never duplicates.

| Status | Body | Meaning |
|--------|------|---------|
| 201 | `{ status: "created", id, date, amount, description, category, categorySource }` | Added. The category is the one used before for that merchant (`history`), else a keyword guess (`keywords`), else "אחר" (`default`) |
| 200 | `{ status: "duplicate", id }` | This message was already added; nothing changes |
| 200 | `{ status: "duplicate-of-manual", existing }` | An expense entered by hand on the same day for the same amount exists; skipped |
| 422 | `{ status: "unparsed", reason }` | Not a plain shekel purchase (`refund-or-cancellation`, `unsupported-currency:USD`, `unrecognized-format`, ...); enter it by hand |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/transactions?month=6&year=2026` | List transactions for month |
| POST | `/api/transactions` | Create transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/health` | Health check — `{ status: "ok", app: "cash-flow" }` |
| GET | `/api/summary` | Current month summary (netBalance, totalIncome, totalExpenses) |
