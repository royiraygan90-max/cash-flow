# Subscriptions Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add monthly subscription management — CRUD UI, auto-apply as expense transactions on matching day of month, top nav bar.

**Architecture:** New `Subscription` Prisma model; four API route files; a `"use client"` subscriptions page with inline modal; two new layout components (`NavBar`, `SubscriptionsAutoApply`); layout updated to render them above `{children}`. No new deps — follows the existing inline-style, RTL Hebrew pattern throughout.

**Tech Stack:** Next.js 14 App Router, Prisma 5, PostgreSQL, React 18, TypeScript, Tailwind (utility classes only for responsive breakpoints), Inter + JetBrains Mono fonts.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `prisma/schema.prisma` | Add `Subscription` model |
| Create | `app/api/subscriptions/route.ts` | GET list / POST create |
| Create | `app/api/subscriptions/[id]/route.ts` | PUT update / DELETE delete |
| Create | `app/api/subscriptions/apply/route.ts` | POST auto-apply today's subscriptions |
| Create | `app/components/NavBar.tsx` | Sticky top nav with dashboard + subscriptions links |
| Create | `app/components/SubscriptionsAutoApply.tsx` | Client-side fire-and-forget apply call on mount |
| Modify | `app/layout.tsx` | Add `<NavBar>` and `<SubscriptionsAutoApply>` |
| Create | `app/subscriptions/page.tsx` | Full subscriptions CRUD page |

---

## Task 1: Add Subscription model and run migration

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add the Subscription model to the schema**

Open `prisma/schema.prisma` and append after the `Transaction` model:

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

Full file should now look like:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Transaction {
  id          String   @id @default(cuid())
  date        DateTime
  type        String
  category    String
  description String
  amount      Float
  createdAt   DateTime @default(now())
}

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

- [ ] **Step 2: Run the migration**

```bash
npx prisma migrate dev --name add_subscription
```

Expected output contains:
```
Applying migration `..._add_subscription`
Your database is now in sync with your schema.
```

- [ ] **Step 3: Verify generated client includes Subscription**

```bash
npx prisma studio
```

Check that a `Subscription` table exists (or just inspect `node_modules/.prisma/client/index.d.ts` for `subscription` property on `PrismaClient`). Then close studio.

Alternatively:
```bash
grep -r "subscription" node_modules/.prisma/client/index.d.ts | head -5
```
Expected: lines mentioning `subscription` and `Subscription`.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add Subscription prisma model"
```

---

## Task 2: API route — GET/POST /api/subscriptions

**Files:**
- Create: `app/api/subscriptions/route.ts`

- [ ] **Step 1: Create the route file**

Create `app/api/subscriptions/route.ts` with this exact content:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { dayOfMonth: "asc" },
  });
  return NextResponse.json(subscriptions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, amount, dayOfMonth, category } = body;

  if (!name || !amount || !dayOfMonth) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const subscription = await prisma.subscription.create({
    data: {
      name,
      amount: parseFloat(amount),
      dayOfMonth: parseInt(dayOfMonth),
      category: category ?? "מנוי",
    },
  });

  return NextResponse.json(subscription, { status: 201 });
}
```

- [ ] **Step 2: Start dev server and verify**

```bash
npm run dev
```

In a second terminal:

```bash
# Create a test subscription
curl -s -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"name":"Netflix","amount":50,"dayOfMonth":15}' | jq .
```

Expected: JSON object with `id`, `name: "Netflix"`, `amount: 50`, `dayOfMonth: 15`, `category: "מנוי"`, `isActive: true`.

```bash
# List subscriptions
curl -s http://localhost:3000/api/subscriptions | jq .
```

Expected: array containing the subscription you just created.

- [ ] **Step 3: Commit**

```bash
git add app/api/subscriptions/route.ts
git commit -m "feat: add GET/POST /api/subscriptions route"
```

---

## Task 3: API route — PUT/DELETE /api/subscriptions/[id]

**Files:**
- Create: `app/api/subscriptions/[id]/route.ts`

- [ ] **Step 1: Create the route file**

Create `app/api/subscriptions/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { name, amount, dayOfMonth, category, isActive } = body;

  try {
    const updated = await prisma.subscription.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(dayOfMonth !== undefined && { dayOfMonth: parseInt(dayOfMonth) }),
        ...(category !== undefined && { category }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.subscription.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
```

- [ ] **Step 2: Verify with curl**

Grab an `id` from the GET response in Task 2, then:

```bash
# Toggle isActive to false
curl -s -X PUT http://localhost:3000/api/subscriptions/<PASTE_ID_HERE> \
  -H "Content-Type: application/json" \
  -d '{"isActive":false}' | jq .isActive
```

Expected: `false`

```bash
# Delete
curl -s -X DELETE http://localhost:3000/api/subscriptions/<PASTE_ID_HERE> | jq .
```

Expected: `{ "success": true }`

- [ ] **Step 3: Commit**

```bash
git add app/api/subscriptions/[id]/route.ts
git commit -m "feat: add PUT/DELETE /api/subscriptions/[id] route"
```

---

## Task 4: API route — POST /api/subscriptions/apply

**Files:**
- Create: `app/api/subscriptions/apply/route.ts`

- [ ] **Step 1: Create the route file**

Create `app/api/subscriptions/apply/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const today = new Date();
  const todayDay = today.getDate();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1);

  const activeSubscriptions = await prisma.subscription.findMany({
    where: { isActive: true, dayOfMonth: todayDay },
  });

  let inserted = 0;

  for (const sub of activeSubscriptions) {
    const existing = await prisma.transaction.findFirst({
      where: {
        description: sub.name,
        amount: sub.amount,
        date: { gte: monthStart, lt: monthEnd },
      },
    });

    if (!existing) {
      await prisma.transaction.create({
        data: {
          type: "expense",
          description: sub.name,
          amount: sub.amount,
          category: sub.category,
          date: today,
        },
      });
      inserted++;
    }
  }

  return NextResponse.json({ inserted });
}
```

- [ ] **Step 2: Verify with curl**

First create a subscription whose `dayOfMonth` matches today's date (check `date +%d` to get today's day):

```bash
TODAY=$(date +%-d)   # e.g. 15
curl -s -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"TestSub\",\"amount\":99,\"dayOfMonth\":$TODAY}" | jq .id
```

Then call apply twice — first call should insert, second should not:

```bash
curl -s -X POST http://localhost:3000/api/subscriptions/apply | jq .
# Expected: { "inserted": 1 }

curl -s -X POST http://localhost:3000/api/subscriptions/apply | jq .
# Expected: { "inserted": 0 }   ← idempotent
```

Clean up the test subscription:
```bash
# Get the id from the create step above, then:
curl -s -X DELETE http://localhost:3000/api/subscriptions/<ID>
```

- [ ] **Step 3: Commit**

```bash
git add app/api/subscriptions/apply/route.ts
git commit -m "feat: add POST /api/subscriptions/apply route"
```

---

## Task 5: NavBar component

**Files:**
- Create: `app/components/NavBar.tsx`

- [ ] **Step 1: Create the component**

Create `app/components/NavBar.tsx`:

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  function linkStyle(href: string): React.CSSProperties {
    const active = pathname === href;
    return {
      fontFamily: "Inter, sans-serif",
      fontSize: "0.875rem",
      fontWeight: active ? 600 : 400,
      color: active ? "#00875a" : "#6b7280",
      textDecoration: "none",
      padding: "4px 0",
      borderBottom: active ? "2px solid #00875a" : "2px solid transparent",
      transition: "color 0.15s, border-color 0.15s",
    };
  }

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "#ffffff",
        borderBottom: "1px solid #e8e8e8",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        direction: "rtl",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          gap: "24px",
          height: "56px",
        }}
      >
        <Link href="/" style={linkStyle("/")}>
          מאזן
        </Link>
        <Link href="/subscriptions" style={linkStyle("/subscriptions")}>
          מנויים
        </Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/NavBar.tsx
git commit -m "feat: add NavBar component"
```

---

## Task 6: SubscriptionsAutoApply component + update layout

**Files:**
- Create: `app/components/SubscriptionsAutoApply.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create SubscriptionsAutoApply**

Create `app/components/SubscriptionsAutoApply.tsx`:

```typescript
"use client";

import { useEffect } from "react";

export default function SubscriptionsAutoApply() {
  useEffect(() => {
    fetch("/api/subscriptions/apply", { method: "POST" }).catch(() => {});
  }, []);
  return null;
}
```

- [ ] **Step 2: Update app/layout.tsx**

Replace the entire content of `app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/app/components/NavBar";
import SubscriptionsAutoApply from "@/app/components/SubscriptionsAutoApply";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "מאזן חודשי",
  description: "מעקב תזרים מזומנים אישי",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${inter.variable} ${jetbrains.variable}`}>
        <NavBar />
        <SubscriptionsAutoApply />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify in browser**

Visit `http://localhost:3000`. You should see a white sticky nav bar at the top with "מאזן" (green/active) and "מנויים" (gray) links. The dashboard content below should be unchanged. Network tab should show a POST to `/api/subscriptions/apply` on load.

- [ ] **Step 4: Commit**

```bash
git add app/components/SubscriptionsAutoApply.tsx app/layout.tsx
git commit -m "feat: add NavBar and auto-apply to layout"
```

---

## Task 7: Subscriptions page

**Files:**
- Create: `app/subscriptions/page.tsx`

- [ ] **Step 1: Create the page**

Create `app/subscriptions/page.tsx` with this full content:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { CATEGORY_COLORS } from "@/lib/categoryColors";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  dayOfMonth: number;
  category: string;
  isActive: boolean;
}

interface FormData {
  name: string;
  amount: string;
  dayOfMonth: string;
  category: string;
}

const DEFAULT_FORM: FormData = { name: "", amount: "", dayOfMonth: "", category: "מנוי" };

function SubscriptionRow({
  sub,
  onEdit,
  onDelete,
  onToggle,
}: {
  sub: Subscription;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const color = CATEGORY_COLORS[sub.category] ?? "#6b7280";

  return (
    <div
      className="group"
      style={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #f5f5f5",
        padding: "16px 24px",
        direction: "rtl",
        gap: "12px",
        opacity: sub.isActive ? 1 : 0.45,
        transition: "background 0.1s, opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#fafafa")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Amount */}
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          color: "#dc2626",
          fontSize: "0.95rem",
          minWidth: "100px",
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        −₪{sub.amount.toLocaleString("he-IL")}
      </span>

      {/* Name */}
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "0.9rem",
          color: "#111111",
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {sub.name}
      </span>

      {/* Day badge */}
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "0.7rem",
          color: "#6b7280",
          flexShrink: 0,
          whiteSpace: "nowrap",
        }}
      >
        כל ה-{sub.dayOfMonth} לחודש
      </span>

      {/* Category badge */}
      <span
        style={{
          background: `${color}26`,
          color,
          border: `1px solid ${color}4d`,
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "0.7rem",
          fontWeight: 500,
          fontFamily: "Inter, sans-serif",
          flexShrink: 0,
        }}
      >
        {sub.category}
      </span>

      {/* Active toggle */}
      <button
        onClick={onToggle}
        title={sub.isActive ? "השבת מנוי" : "הפעל מנוי"}
        style={{
          background: sub.isActive ? "#f0fdf4" : "#f5f5f5",
          border: `1px solid ${sub.isActive ? "#00875a" : "#e8e8e8"}`,
          color: sub.isActive ? "#00875a" : "#9ca3af",
          borderRadius: "4px",
          padding: "4px 8px",
          fontSize: "0.7rem",
          fontFamily: "Inter, sans-serif",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {sub.isActive ? "פעיל" : "כבוי"}
      </button>

      {/* Edit button */}
      <button
        onClick={onEdit}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#9ca3af",
          fontSize: "0.8rem",
          fontFamily: "Inter, sans-serif",
          padding: "4px 6px",
          flexShrink: 0,
          transition: "color 0.1s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#111111")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
      >
        עריכה
      </button>

      {/* Delete with confirm */}
      {confirm ? (
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
          <button
            onClick={onDelete}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#dc2626",
              fontSize: "0.7rem",
              fontFamily: "Inter, sans-serif",
              padding: 0,
            }}
          >
            כן
          </button>
          <button
            onClick={() => setConfirm(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              fontSize: "0.7rem",
              padding: 0,
            }}
          >
            לא
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirm(true)}
          aria-label="מחק"
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#d1d5db",
            fontSize: "1rem",
            lineHeight: 1,
            padding: 0,
            flexShrink: 0,
            transition: "color 0.1s, opacity 0.1s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#d1d5db")}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [modal, setModal] = useState<{ open: boolean; editing: Subscription | null }>({
    open: false,
    editing: null,
  });
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const load = useCallback(async () => {
    const res = await fetch("/api/subscriptions");
    setSubscriptions(await res.json());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!modal.open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.open]);

  function openAdd() {
    setForm(DEFAULT_FORM);
    setModal({ open: true, editing: null });
  }

  function openEdit(sub: Subscription) {
    setForm({
      name: sub.name,
      amount: String(sub.amount),
      dayOfMonth: String(sub.dayOfMonth),
      category: sub.category,
    });
    setModal({ open: true, editing: sub });
  }

  function closeModal() {
    setModal({ open: false, editing: null });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (modal.editing) {
      await fetch(`/api/subscriptions/${modal.editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          amount: parseFloat(form.amount),
          dayOfMonth: parseInt(form.dayOfMonth),
          category: form.category,
        }),
      });
    } else {
      await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          amount: parseFloat(form.amount),
          dayOfMonth: parseInt(form.dayOfMonth),
          category: form.category,
        }),
      });
    }
    setSaving(false);
    closeModal();
    load();
  }

  async function handleToggle(sub: Subscription) {
    await fetch(`/api/subscriptions/${sub.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !sub.isActive }),
    });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    load();
  }

  const totalMonthly = subscriptions
    .filter((s) => s.isActive)
    .reduce((sum, s) => sum + s.amount, 0);

  const inputStyle: React.CSSProperties = {
    background: "#f9fafb",
    border: "1px solid #e8e8e8",
    color: "#111111",
    borderRadius: "6px",
    padding: "10px 14px",
    fontSize: "0.9rem",
    fontFamily: "Inter, sans-serif",
    outline: "none",
    width: "100%",
    transition: "border-color 0.15s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.7rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    color: "#6b7280",
    marginBottom: "6px",
    display: "block",
    fontFamily: "Inter, sans-serif",
  };

  const accentColor = "#dc2626";

  const modalStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: "16px 16px 0 0",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
        padding: "24px 20px",
        maxHeight: "90vh",
        overflowY: "auto",
      }
    : {
        background: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: "8px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        padding: "40px",
        width: "100%",
        maxWidth: "480px",
      };

  return (
    <main
      className="min-h-screen px-4 py-4 md:px-12 pb-24 max-w-[1400px] mx-auto"
      style={{ background: "#f5f5f5", direction: "rtl" }}
    >
      {/* Page title */}
      <div style={{ marginTop: "24px", marginBottom: "16px" }}>
        <h1
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#111111",
          }}
        >
          מנויים חודשיים 📦
        </h1>
      </div>

      {/* Monthly total KPI card */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e8e8e8",
          borderTopColor: "#dc2626",
          borderTopWidth: "3px",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          padding: "20px 28px",
          marginBottom: "20px",
          display: "inline-block",
          minWidth: "240px",
        }}
      >
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#9ca3af",
            marginBottom: "12px",
          }}
        >
          סה״כ מנויים
        </p>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: "1.75rem",
            color: "#dc2626",
            lineHeight: 1,
            display: "flex",
            alignItems: "flex-start",
            gap: "4px",
          }}
        >
          <span
            style={{
              fontSize: "1rem",
              fontWeight: 400,
              color: "#dc2626",
              marginTop: "5px",
              opacity: 0.8,
            }}
          >
            ₪
          </span>
          {totalMonthly.toLocaleString("he-IL")}
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 400,
              color: "#9ca3af",
              alignSelf: "flex-end",
              marginBottom: "2px",
              marginRight: "4px",
            }}
          >
            / חודש
          </span>
        </p>
      </div>

      {/* Subscriptions list card */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e8e8e8",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {/* List header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#111111",
            }}
          >
            מנויים ({subscriptions.length})
          </p>
          <button
            onClick={openAdd}
            style={{
              background: "#00875a",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "0.85rem",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#006644")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#00875a")}
          >
            + הוסף מנוי
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "0.875rem",
              fontFamily: "Inter, sans-serif",
            }}
          >
            אין מנויים עדיין
          </div>
        ) : (
          subscriptions.map((sub) => (
            <SubscriptionRow
              key={sub.id}
              sub={sub}
              onEdit={() => openEdit(sub)}
              onDelete={() => handleDelete(sub.id)}
              onToggle={() => handleToggle(sub)}
            />
          ))
        )}
      </div>

      {/* Add / Edit modal */}
      {modal.open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: 50,
            padding: isMobile ? 0 : "16px",
            direction: "rtl",
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div style={modalStyle}>
            {/* Mobile drag handle */}
            {isMobile && (
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
                <div
                  style={{ width: "40px", height: "4px", background: "#e8e8e8", borderRadius: "2px" }}
                />
              </div>
            )}

            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "28px",
              }}
            >
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#111111",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {modal.editing ? "עריכת מנוי" : "מנוי חדש"}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  fontSize: "1.25rem",
                  lineHeight: 1,
                  padding: "4px",
                  transition: "color 0.1s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#111111")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Name */}
              <div>
                <label style={labelStyle}>שם</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Netflix, גים..."
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e8e8e8")}
                />
              </div>

              {/* Amount */}
              <div>
                <label style={labelStyle}>סכום (₪)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0"
                  style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e8e8e8")}
                />
              </div>

              {/* Day of month */}
              <div>
                <label style={labelStyle}>יום בחודש (1–31)</label>
                <input
                  type="number"
                  value={form.dayOfMonth}
                  onChange={(e) => setForm((f) => ({ ...f, dayOfMonth: e.target.value }))}
                  required
                  min="1"
                  max="31"
                  placeholder="1"
                  style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e8e8e8")}
                />
              </div>

              {/* Category */}
              <div>
                <label style={labelStyle}>קטגוריה</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="מנוי"
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = accentColor)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#e8e8e8")}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: accentColor,
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  fontFamily: "Inter, sans-serif",
                  opacity: saving ? 0.7 : 1,
                  transition: "background 0.15s, opacity 0.15s",
                  marginTop: "4px",
                }}
                onMouseEnter={(e) => {
                  if (!saving) e.currentTarget.style.background = "#b91c1c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = accentColor;
                }}
              >
                {saving ? "שומר..." : modal.editing ? "שמור שינויים" : "הוסף מנוי"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

Visit `http://localhost:3000/subscriptions`.

Check:
- Title "מנויים חודשיים 📦" visible
- KPI card shows "סה״כ מנויים: ₪0 / חודש"
- Empty state "אין מנויים עדיין"
- Click "+ הוסף מנוי" → modal opens
- Fill in שם, סכום, יום, קטגוריה → submit
- Card appears with correct data, KPI updates
- Toggle button switches between פעיל/כבוי
- Click עריכה → modal pre-filled
- Click × → deletes after confirm
- Nav link "מנויים" shows green/active underline
- Navigate to "/" → "מאזן" shows green/active

- [ ] **Step 3: Commit**

```bash
git add app/subscriptions/page.tsx
git commit -m "feat: add subscriptions page with CRUD and modal"
```

---

## Task 8: Build verification

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: output ends with something like:
```
Route (app)                              Size     First Load JS
┌ ○ /                                   ...
├ ○ /subscriptions                      ...
...
✓ Compiled successfully
```

Zero TypeScript errors, zero build errors.

- [ ] **Step 2: Fix any TypeScript errors**

If the build fails with type errors, read the error messages carefully. Common issues and fixes:

- `params.id` type error in Next.js 14: The `{ params }` type should be `{ params: { id: string } }` (already in the route code above — no change needed).
- Unused import: remove it.
- Missing `return` type annotation: add `: Promise<NextResponse>` to async route handlers if required.

Re-run `npm run build` after each fix until clean.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: subscriptions feature complete — CRUD, apply, nav"
```
