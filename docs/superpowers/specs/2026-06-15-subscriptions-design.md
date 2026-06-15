# Subscriptions Feature — Design Spec

**Date:** 2026-06-15  
**Status:** Approved

---

## Overview

Add a monthly subscriptions management feature to the cash-flow app. Users can define recurring subscriptions (e.g. Netflix, gym) with a fixed amount and day of month. On app load, subscriptions whose day matches today are automatically inserted as expense transactions (once per month, idempotent).

---

## Database

Add a new `Subscription` model to `prisma/schema.prisma`:

```prisma
model Subscription {
  id         String   @id @default(cuid())
  name       String
  amount     Float
  dayOfMonth Int
  category   String   @default("מנוי")
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
}
```

Run `prisma migrate dev` to generate and apply the migration.

---

## API Routes

### `app/api/subscriptions/route.ts`
- **GET**: return all subscriptions ordered by `dayOfMonth` ascending
- **POST**: create subscription — body: `{ name, amount, dayOfMonth, category? }` (category defaults to "מנוי")

### `app/api/subscriptions/[id]/route.ts`
- **PUT**: update subscription by id — body: any subset of `{ name, amount, dayOfMonth, category, isActive }`
- **DELETE**: delete subscription by id

### `app/api/subscriptions/apply/route.ts`
- **POST**: iterate all active subscriptions; for each where `dayOfMonth == today's date day`:
  - Query for existing Transaction this calendar month+year where `description == sub.name AND amount == sub.amount`
  - If none found, insert `{ type: "expense", description: sub.name, amount: sub.amount, category: sub.category, date: today }`
- Return `{ inserted: N }`
- Called silently on app load; errors are swallowed client-side

---

## Subscriptions Page

**File:** `app/subscriptions/page.tsx`  
**Directive:** `"use client"` — all data fetched client-side via fetch

### Layout
- Page title: "מנויים חודשיים 📦"
- Monthly total strip: single KPI-style card ("סה״כ מנויים: X ₪ / חודש") — same inline-style card pattern as `KPIStrip`
- Subscription cards list below
- Floating "הוסף מנוי" button (bottom-right, same pattern as `FloatingAddButton`)

### Subscription Card
Each card shows:
- Name (bold)
- Amount (₪, JetBrains Mono, red accent like expenses)
- Day badge: "כל ה-{dayOfMonth} לחודש"
- Category badge — same `CategoryTag` style from `TransactionList`
- Active/inactive toggle — calls `PUT /api/subscriptions/{id}` with `{ isActive: !current }`
- Edit button → opens modal pre-filled
- Delete button → confirm then `DELETE /api/subscriptions/{id}`

### Add/Edit Modal
Same inline-style pattern as `AddTransactionModal`:
- Fields: שם (text, required), סכום (number, required), יום בחודש (number 1–31, required), קטגוריה (text, default "מנוי")
- Edit pre-fills all fields
- On submit: POST (add) or PUT (edit), then refresh list
- Mobile: bottom sheet; desktop: centered modal

---

## Navigation

Add a sticky top nav bar in `app/layout.tsx`. Since `layout.tsx` is a server component, extract a `"use client"` `<NavBar>` component.

**NavBar styling:**
- White background, `border-bottom: 1px solid #e8e8e8`, `box-shadow: 0 1px 3px rgba(0,0,0,0.06)`
- RTL direction
- Two links: "מאזן" (→ `/`) and "מנויים" (→ `/subscriptions`)
- Active link highlighted with green underline or text color `#00875a`
- Height ~56px

---

## Auto-Apply on Load

Add a `<SubscriptionsAutoApply>` client component (rendered in layout) that calls `POST /api/subscriptions/apply` inside a `useEffect` on mount. The response is ignored; errors are swallowed.

---

## Styling Constraints

- No new dependencies
- All inline styles — match existing card pattern: `background: #ffffff`, `border: 1px solid #e8e8e8`, `borderRadius: 8px`, `boxShadow: 0 1px 3px rgba(0,0,0,0.06)`
- Hebrew RTL throughout (`direction: "rtl"`)
- Fonts: Inter for labels/text, JetBrains Mono for amounts/numbers
- Color palette: green `#00875a`, red `#dc2626`, muted `#9ca3af`, secondary `#6b7280`, primary `#111111`

---

## Files Created / Modified

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Add `Subscription` model |
| `prisma/migrations/*/migration.sql` | Auto-generated |
| `app/api/subscriptions/route.ts` | Create |
| `app/api/subscriptions/[id]/route.ts` | Create |
| `app/api/subscriptions/apply/route.ts` | Create |
| `app/subscriptions/page.tsx` | Create |
| `app/components/NavBar.tsx` | Create |
| `app/components/SubscriptionsAutoApply.tsx` | Create |
| `app/layout.tsx` | Modify — add NavBar + SubscriptionsAutoApply |

---

## Verification

1. `npm run build` — zero errors
2. Dashboard page still works (nav present, links correct)
3. Subscriptions page renders, CRUD works
4. Apply route deduplicates correctly (idempotent on same-day reload)
