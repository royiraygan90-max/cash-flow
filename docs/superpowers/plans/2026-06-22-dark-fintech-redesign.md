# Cash Flow Dark Fintech Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Cash Flow app from its current light "terminal" theme to a dark fintech design system — visual layer only, zero backend changes.

**Architecture:** Design tokens are centralised in `globals.css` (CSS variables) and `tailwind.config.ts`. All UI components are replaced in-place using the same props/API so page logic requires minimal changes. A new `AppNav` component owns both the desktop top bar and the mobile bottom-tab-bar + FAB, absorbing `FloatingAddButton`. A new `Icon` helper wraps Material Symbols Rounded. `categoryColors.ts` is extended with an `icon` field and becomes the single source of truth for chip colour + icon across every list/grid.

**Tech Stack:** Next.js 14 App Router, React 18, Tailwind CSS 3, Recharts 3, Prisma 5, Rubik (next/font/google), Material Symbols Rounded (Google Fonts CDN)

## Global Constraints

- Do NOT modify any file under `app/api/`, `lib/prisma.ts`, `prisma/schema.prisma`, or `prisma/seed.ts`.
- Do NOT rename any category string key (they are stored in the DB): `משכורת פרילנס מסחר שכירות מזון תחבורה בילויים בריאות ביגוד חיסכון אחר מנוי`.
- Do NOT add new routes, pages, or features beyond what is in this spec.
- Every task must end with `npm run build` passing with no TypeScript errors.
- No testing framework exists — verification is always `npm run build`.
- RTL direction (`dir="rtl"`, `lang="he"`) must be preserved everywhere.
- All text uses Rubik (weights 300–700). No mono fonts anywhere. Numbers stay in Rubik with `dir="ltr"` on the inline span only.
- Material Symbols icon names follow the exact strings listed in this plan.

---

### Task 1: Design tokens — globals.css + tailwind.config.ts

**Files:**
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`

**Interfaces:**
- Produces: CSS custom properties consumed by every subsequent task via `var(--*)` and Tailwind utility classes.

- [ ] **Step 1: Replace globals.css**

Full replacement — keep only `@tailwind` directives, the new `:root` block, `*` reset, `html/body`, and scrollbar styles:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-primary:    #0d1014;
  --bg-secondary:  #11151b;
  --bg-tertiary:   #161b22;
  --bg-card:       #1b2230;
  --bg-bar:        #0b0e12;
  --card-border:   #20272f;
  --card-gradient: linear-gradient(155deg, #171d26, #10151c);

  --text-primary:   #f2f5f8;
  --text-secondary: #cdd5de;
  --text-muted:     #9aa6b4;
  --text-disabled:  #6b7785;
  --text-faint:     #5c6776;

  --income:         #34e0a1;
  --income-bg:      #101a16;
  --income-border:  #1c3329;
  --expense:        #ff6b6b;
  --expense-light:  #ff8f8f;
  --expense-bg:     #1c1316;
  --expense-border: #3a2226;

  --accent-purple: #a78bfa;
  --accent-pink:   #f472b6;
  --accent-blue:   #52b9ff;
  --accent-orange: #ffb454;
  --accent-indigo: #818cf8;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Rubik', sans-serif;
  min-height: 100vh;
}

::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg-primary); }
::-webkit-scrollbar-thumb { background: var(--bg-tertiary); }
```

- [ ] **Step 2: Replace tailwind.config.ts**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary":      "#0d1014",
        "bg-secondary":    "#11151b",
        "bg-tertiary":     "#161b22",
        "bg-card":         "#1b2230",
        "bg-bar":          "#0b0e12",
        "card-border":     "#20272f",
        income:            "#34e0a1",
        "income-bg":       "#101a16",
        "income-border":   "#1c3329",
        expense:           "#ff6b6b",
        "expense-light":   "#ff8f8f",
        "expense-bg":      "#1c1316",
        "expense-border":  "#3a2226",
        "accent-purple":   "#a78bfa",
        "accent-pink":     "#f472b6",
        "accent-blue":     "#52b9ff",
        "accent-orange":   "#ffb454",
        "accent-indigo":   "#818cf8",
        "text-primary":    "#f2f5f8",
        "text-secondary":  "#cdd5de",
        "text-muted":      "#9aa6b4",
        "text-disabled":   "#6b7785",
        "text-faint":      "#5c6776",
      },
      fontFamily: {
        sans: ["Rubik", "sans-serif"],
      },
      maxWidth: {
        terminal: "1400px",
      },
      boxShadow: {
        card:  "0 1px 3px rgba(0,0,0,0.3)",
        modal: "0 20px 60px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Build check**

```bash
cd /Users/royiraygan/cash-flow && npm run build
```

Expected: build succeeds (0 TS errors). Tailwind may warn about unused classes — that is fine.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css tailwind.config.ts
git commit -m "style: replace light tokens with dark fintech design system"
```

---

### Task 2: Icon helper + font swap in layout.tsx

**Files:**
- Create: `app/components/Icon.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `<Icon name="restaurant" size={24} />` — a `<span>` with the Material Symbols Rounded class. All later tasks import this.
- Consumes: nothing from previous tasks beyond global CSS.

- [ ] **Step 1: Create Icon.tsx**

```tsx
interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 24, className = "" }: IconProps) {
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: "'FILL' 1",
        lineHeight: 1,
        display: "inline-flex",
        alignItems: "center",
        userSelect: "none",
      }}
    >
      {name}
    </span>
  );
}
```

- [ ] **Step 2: Replace app/layout.tsx**

Swap Inter + JetBrains_Mono for Rubik, add Material Symbols `<link>` tags, update body class, keep NavBar temporarily (will be replaced in Task 4):

```tsx
import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import NavBar from "@/app/components/NavBar";
import SubscriptionsAutoApply from "@/app/components/SubscriptionsAutoApply";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rubik",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "מאזן חודשי",
  description: "מעקב תזרים מזומנים אישי",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0..1,0&display=block"
          rel="stylesheet"
        />
      </head>
      <body className={rubik.variable} style={{ fontFamily: "Rubik, sans-serif" }}>
        <NavBar />
        <SubscriptionsAutoApply />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Build check**

```bash
cd /Users/royiraygan/cash-flow && npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/components/Icon.tsx app/layout.tsx
git commit -m "style: swap Inter/JetBrains to Rubik, add Material Symbols, Icon helper"
```

---

### Task 3: categoryColors.ts — add icon field, remap to dark accents

**Files:**
- Modify: `lib/categoryColors.ts`

**Interfaces:**
- Produces: `CategoryColor { bg: string; color: string; border: string; icon: string }` — every subsequent component reads `.icon` for the Material Symbols name.
- Consumes: nothing.

- [ ] **Step 1: Replace lib/categoryColors.ts**

```ts
export interface CategoryColor {
  bg: string;
  color: string;
  border: string;
  icon: string;
}

const GRAY: CategoryColor = {
  bg: "#9aa6b422",
  color: "#9aa6b4",
  border: "#9aa6b444",
  icon: "category",
};

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  // Income
  משכורת: { bg: "#34e0a122", color: "#34e0a1", border: "#34e0a144", icon: "payments" },
  פרילנס: { bg: "#34e0a122", color: "#34e0a1", border: "#34e0a144", icon: "payments" },
  מסחר:   { bg: "#34e0a122", color: "#34e0a1", border: "#34e0a144", icon: "payments" },
  // Food
  מזון:    { bg: "#a78bfa22", color: "#a78bfa", border: "#a78bfa44", icon: "restaurant" },
  // Entertainment
  בילויים: { bg: "#f472b622", color: "#f472b6", border: "#f472b644", icon: "celebration" },
  // Transport
  תחבורה:  { bg: "#52b9ff22", color: "#52b9ff", border: "#52b9ff44", icon: "directions_car" },
  // Health
  בריאות:  { bg: "#ffb45422", color: "#ffb454", border: "#ffb45444", icon: "favorite" },
  // Housing
  שכירות:  { bg: "#52b9ff22", color: "#52b9ff", border: "#52b9ff44", icon: "home_work" },
  // Clothing
  ביגוד:   { bg: "#f472b622", color: "#f472b6", border: "#f472b644", icon: "checkroom" },
  // Savings
  חיסכון:  { bg: "#34e0a122", color: "#34e0a1", border: "#34e0a144", icon: "savings" },
  // Subscription
  מנוי:    { bg: "#818cf822", color: "#818cf8", border: "#818cf844", icon: "autorenew" },
  // Fallback
  אחר:     GRAY,
};

export const DEFAULT_CATEGORY_COLOR: CategoryColor = GRAY;
```

- [ ] **Step 2: Build check**

```bash
cd /Users/royiraygan/cash-flow && npm run build
```

Expected: succeeds. Some components that use `CATEGORY_COLORS` may now look different at runtime — that's expected since they still render the old bg/color values from the updated map.

- [ ] **Step 3: Commit**

```bash
git add lib/categoryColors.ts
git commit -m "style: extend CategoryColor with icon field, remap to dark accents"
```

---

### Task 4: AppNav.tsx — bottom tab bar + FAB + desktop top bar

> **⚠️ layout.tsx NavBar → AppNav swap is PART OF THIS TASK.**
> Step 2 below replaces the NavBar import in `app/layout.tsx` with AppNav. Do NOT defer this to Task 13.
> Task 13 only deletes the now-unused `NavBar.tsx` file and runs the final build check — if `layout.tsx` still imports NavBar at that point the build will fail.

**Files:**
- Create: `app/components/AppNav.tsx`
- Modify: `app/layout.tsx` — remove `import NavBar` and `<NavBar />`, add `import AppNav` and `<AppNav />` (done in Step 2 of this task)
- Delete: `app/components/FloatingAddButton.tsx`
- Modify: `app/page.tsx` (remove FloatingAddButton import + render)

**Interfaces:**
- Consumes: `AddTransactionModal` (dynamic import, same API as before), `Icon` from Task 2.
- Produces: exported default `AppNav` — no props needed.

- [ ] **Step 1: Create app/components/AppNav.tsx**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import Icon from "./Icon";

const AddTransactionModal = dynamic(() => import("./AddTransactionModal"), { ssr: false });

const NAV_ITEMS = [
  { href: "/", label: "בית", icon: "home" },
  { href: "/subscriptions", label: "מנויים", icon: "autorenew" },
];

export default function AppNav() {
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);

  function isActive(href: string) {
    return pathname === href;
  }

  return (
    <>
      {modalOpen && <AddTransactionModal onClose={() => setModalOpen(false)} />}

      {/* ── Mobile bottom tab bar ── hidden on md+ */}
      <nav
        className="md:hidden"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: "#0b0e12",
          borderTop: "1px solid #161b22",
          padding: "14px 26px calc(26px + env(safe-area-inset-bottom))",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-around",
        }}
      >
        {/* Left tab — בית */}
        <Link
          href={NAV_ITEMS[0].href}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            textDecoration: "none",
            color: isActive(NAV_ITEMS[0].href) ? "#34e0a1" : "#5c6776",
            fontWeight: isActive(NAV_ITEMS[0].href) ? 500 : 400,
            fontSize: 11,
            transition: "color 0.15s",
            minWidth: 60,
          }}
        >
          <Icon name={NAV_ITEMS[0].icon} size={22} />
          {NAV_ITEMS[0].label}
        </Link>

        {/* Center FAB */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -28 }}>
          <button
            onClick={() => setModalOpen(true)}
            aria-label="הוסף עסקה"
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#34e0a1",
              color: "#06231a",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 20px -6px rgba(52,224,161,.6)",
              transition: "transform 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Icon name="add" size={28} />
          </button>
        </div>

        {/* Right tab — מנויים */}
        <Link
          href={NAV_ITEMS[1].href}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            textDecoration: "none",
            color: isActive(NAV_ITEMS[1].href) ? "#34e0a1" : "#5c6776",
            fontWeight: isActive(NAV_ITEMS[1].href) ? 500 : 400,
            fontSize: 11,
            transition: "color 0.15s",
            minWidth: 60,
          }}
        >
          <Icon name={NAV_ITEMS[1].icon} size={22} />
          {NAV_ITEMS[1].label}
        </Link>
      </nav>

      {/* ── Desktop top bar ── hidden below md */}
      <nav
        className="hidden md:flex"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "#0b0e12",
          borderBottom: "1px solid #161b22",
          height: 56,
          alignItems: "center",
          padding: "0 24px",
          gap: 24,
          direction: "rtl",
        }}
      >
        {NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              fontFamily: "Rubik, sans-serif",
              fontSize: 14,
              fontWeight: isActive(href) ? 500 : 400,
              color: isActive(href) ? "#34e0a1" : "#5c6776",
              textDecoration: "none",
              padding: "4px 0",
              borderBottom: isActive(href) ? "2px solid #34e0a1" : "2px solid transparent",
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            {label}
          </Link>
        ))}

        {/* Desktop "add" button — right-aligned via margin-right: auto on desktop rtl layout */}
        <div style={{ marginRight: "auto" }}>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              background: "#34e0a1",
              color: "#06231a",
              border: "none",
              borderRadius: 10,
              padding: "7px 14px",
              fontSize: 13,
              fontFamily: "Rubik, sans-serif",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            + הוסף עסקה
          </button>
        </div>
      </nav>
    </>
  );
}
```

- [ ] **Step 2: Update app/layout.tsx — replace NavBar with AppNav RIGHT NOW**

This step must happen in Task 4, not later. Remove the `NavBar` import and its `<NavBar />` render; add `AppNav` import and `<AppNav />`. After this step `NavBar` is referenced nowhere in the codebase — Task 13 simply deletes the file. Full replacement:

```tsx
import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import AppNav from "@/app/components/AppNav";
import SubscriptionsAutoApply from "@/app/components/SubscriptionsAutoApply";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rubik",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "מאזן חודשי",
  description: "מעקב תזרים מזומנים אישי",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0..1,0&display=block"
          rel="stylesheet"
        />
      </head>
      <body className={rubik.variable} style={{ fontFamily: "Rubik, sans-serif" }}>
        <AppNav />
        <SubscriptionsAutoApply />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Remove FloatingAddButton from app/page.tsx**

In `app/page.tsx`, remove the import line:
```ts
import FloatingAddButton from "@/app/components/FloatingAddButton";
```
And remove the JSX render `<FloatingAddButton />` from the returned markup. The file should still import and render `MonthNavigator`, `KPIStrip`, the charts, and `TransactionList`.

- [ ] **Step 4: Delete FloatingAddButton.tsx**

```bash
rm /Users/royiraygan/cash-flow/app/components/FloatingAddButton.tsx
```

- [ ] **Step 5: Build check**

```bash
cd /Users/royiraygan/cash-flow && npm run build
```

Expected: build succeeds. NavBar.tsx is now unused (not imported anywhere) but its existence won't cause an error — leave it for now; it will be deleted in Task 13.

- [ ] **Step 6: Commit**

```bash
git add app/components/AppNav.tsx app/layout.tsx app/page.tsx
git rm app/components/FloatingAddButton.tsx
git commit -m "feat: replace NavBar+FloatingAddButton with AppNav (bottom tab bar + FAB + desktop top)"
```

---

### Task 5: MonthNavigator.tsx dark restyle

**Files:**
- Modify: `app/components/MonthNavigator.tsx`

**Interfaces:**
- Same props as before: `{ month: number; year: number }`.
- Logic (navigation, clear-all, CSV export) is unchanged.

- [ ] **Step 1: Replace the component with the dark restyle**

Full file replacement (same logic, new visuals):

```tsx
"use client";

import { useRouter } from "next/navigation";
import Icon from "./Icon";

const HEBREW_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

interface Props {
  month: number;
  year: number;
}

const pillBtn: React.CSSProperties = {
  background: "#161b22",
  border: "1px solid #1f2630",
  color: "#9aa6b4",
  borderRadius: 99,
  padding: "5px 12px",
  fontSize: 12,
  fontFamily: "Rubik, sans-serif",
  fontWeight: 500,
  cursor: "pointer",
  transition: "color 0.15s, background 0.15s",
};

const navBtn: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  background: "#1b2230",
  border: "none",
  color: "#7c8896",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 16,
  transition: "color 0.15s, background 0.15s",
};

export default function MonthNavigator({ month, year }: Props) {
  const router = useRouter();

  function navigate(offset: number) {
    const d = new Date(year, month - 1 + offset, 1);
    router.push(`/?month=${d.getMonth() + 1}&year=${d.getFullYear()}`);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        marginTop: 16,
        padding: "0 2px",
        direction: "rtl",
      }}
    >
      {/* Month label + prev/next */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="חודש קודם"
          style={navBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#f2f5f8";
            e.currentTarget.style.background = "#20272f";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#7c8896";
            e.currentTarget.style.background = "#1b2230";
          }}
        >
          <Icon name="chevron_right" size={18} />
        </button>

        <span
          style={{
            fontSize: 17,
            fontWeight: 600,
            color: "#f2f5f8",
            fontFamily: "Rubik, sans-serif",
          }}
        >
          {HEBREW_MONTHS[month - 1]} {year}
        </span>

        <button
          onClick={() => navigate(1)}
          aria-label="חודש הבא"
          style={navBtn}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#f2f5f8";
            e.currentTarget.style.background = "#20272f";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#7c8896";
            e.currentTarget.style.background = "#1b2230";
          }}
        >
          <Icon name="chevron_left" size={18} />
        </button>
      </div>

      {/* Action pills */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => window.open("/api/export", "_blank")}
          aria-label="ייצוא CSV"
          style={pillBtn}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f2f5f8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#9aa6b4")}
        >
          ייצוא CSV
        </button>
        <button
          onClick={async () => {
            if (confirm("האם אתה בטוח? פעולה זו תמחק את כל העסקאות לצמיתות.")) {
              await fetch("/api/clear", { method: "DELETE" });
              window.location.reload();
            }
          }}
          aria-label="נקה הכל"
          style={{ ...pillBtn, color: "#ff6b6b", borderColor: "#3a2226" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1c1316")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#161b22")}
        >
          נקה הכל
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/royiraygan/cash-flow && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/components/MonthNavigator.tsx
git commit -m "style: MonthNavigator dark restyle with pill buttons and icon nav"
```

---

### Task 6: BalanceHeroCard + InOutRow — new dashboard hero components

**Files:**
- Create: `app/components/BalanceHeroCard.tsx`
- Create: `app/components/InOutRow.tsx`

**Interfaces:**
- `BalanceHeroCard` props: `{ totalIncome: number; totalExpenses: number }`
- `InOutRow` props: `{ totalIncome: number; totalExpenses: number }`
- Both are imported by `app/page.tsx` in Task 11.

- [ ] **Step 1: Create app/components/BalanceHeroCard.tsx**

```tsx
import Icon from "./Icon";

interface Props {
  totalIncome: number;
  totalExpenses: number;
}

function fmt(n: number): string {
  return Math.abs(n).toLocaleString("he-IL");
}

export default function BalanceHeroCard({ totalIncome, totalExpenses }: Props) {
  const balance = totalIncome - totalExpenses;
  const isPositive = balance >= 0;

  return (
    <div
      style={{
        background: "linear-gradient(155deg, #171d26, #10151c)",
        border: "1px solid #20272f",
        borderRadius: 28,
        padding: 24,
        textAlign: "center",
        marginBottom: 12,
      }}
    >
      <p style={{ fontSize: 12, color: "#7c8896", marginBottom: 8, fontFamily: "Rubik, sans-serif" }}>
        מאזן עד כה החודש
      </p>

      <p
        style={{
          fontSize: 46,
          fontWeight: 600,
          color: isPositive ? "#34e0a1" : "#ff6b6b",
          lineHeight: 1,
          fontFamily: "Rubik, sans-serif",
          direction: "ltr",
          display: "inline-block",
        }}
      >
        {isPositive ? "" : "−"}₪{fmt(balance)}
      </p>

      {/* Status pill */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 99,
            background: isPositive ? "rgba(52,224,161,.12)" : "rgba(255,107,107,.12)",
            color: isPositive ? "#9fd9c2" : "#ff8f8f",
            fontSize: 12,
            fontFamily: "Rubik, sans-serif",
            fontWeight: 500,
          }}
        >
          <Icon name={isPositive ? "trending_up" : "trending_down"} size={16} />
          {isPositive ? "מאזן חיובי החודש" : "הוצאת יותר ממה שנכנס"}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create app/components/InOutRow.tsx**

```tsx
interface Props {
  totalIncome: number;
  totalExpenses: number;
}

function fmt(n: number): string {
  return n.toLocaleString("he-IL");
}

export default function InOutRow({ totalIncome, totalExpenses }: Props) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
      {/* Income card */}
      <div
        style={{
          flex: 1,
          background: "#101a16",
          border: "1px solid #1c3329",
          borderRadius: 20,
          padding: "14px 16px",
        }}
      >
        <p style={{ fontSize: 11, color: "#5f8a76", marginBottom: 6, fontFamily: "Rubik, sans-serif" }}>
          נכנס עד כה
        </p>
        <p
          style={{
            fontSize: 23,
            fontWeight: 600,
            color: "#34e0a1",
            fontFamily: "Rubik, sans-serif",
            direction: "ltr",
          }}
        >
          ₪{fmt(totalIncome)}
        </p>
      </div>

      {/* Expense card */}
      <div
        style={{
          flex: 1,
          background: "#1c1316",
          border: "1px solid #3a2226",
          borderRadius: 20,
          padding: "14px 16px",
        }}
      >
        <p style={{ fontSize: 11, color: "#a36a6a", marginBottom: 6, fontFamily: "Rubik, sans-serif" }}>
          יצא עד כה
        </p>
        <p
          style={{
            fontSize: 23,
            fontWeight: 600,
            color: "#ff6b6b",
            fontFamily: "Rubik, sans-serif",
            direction: "ltr",
          }}
        >
          ₪{fmt(totalExpenses)}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Build check**

```bash
cd /Users/royiraygan/cash-flow && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add app/components/BalanceHeroCard.tsx app/components/InOutRow.tsx
git commit -m "feat: add BalanceHeroCard and InOutRow dashboard hero components"
```

---

### Task 7: CategoryBreakdown — replaces ExpenseDonutChart

**Files:**
- Create: `app/components/CategoryBreakdown.tsx`

**Interfaces:**
- Props: `{ data: Array<{ name: string; value: number }> }`
- Imported by `app/page.tsx` in Task 11.
- Consumes: `CATEGORY_COLORS`, `DEFAULT_CATEGORY_COLOR` from `lib/categoryColors.ts`, `Icon` from Task 2.

- [ ] **Step 1: Create app/components/CategoryBreakdown.tsx**

```tsx
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import Icon from "./Icon";

interface CategoryData {
  name: string;
  value: number;
}

interface Props {
  data: CategoryData[];
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("he-IL");
}

export default function CategoryBreakdown({ data }: Props) {
  if (data.length === 0) return null;

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const max = sorted[0].value;

  return (
    <div
      style={{
        background: "#1b2230",
        border: "1px solid #20272f",
        borderRadius: 20,
        padding: "18px 20px",
        marginBottom: 12,
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#f2f5f8",
          marginBottom: 16,
          fontFamily: "Rubik, sans-serif",
        }}
      >
        לאן הלך הכסף
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {sorted.map(({ name, value }) => {
          const c = CATEGORY_COLORS[name] ?? DEFAULT_CATEGORY_COLOR;
          const pct = max > 0 ? (value / max) * 100 : 0;

          return (
            <div key={name}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                  direction: "rtl",
                }}
              >
                {/* Icon chip */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 11,
                    background: c.bg,
                    color: c.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon name={c.icon} size={18} />
                </div>

                {/* Category name */}
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: "#cdd5de",
                    fontFamily: "Rubik, sans-serif",
                  }}
                >
                  {name}
                </span>

                {/* Amount */}
                <span
                  dir="ltr"
                  style={{
                    fontSize: 13,
                    color: "#cdd5de",
                    fontFamily: "Rubik, sans-serif",
                    flexShrink: 0,
                  }}
                >
                  ₪{fmt(value)}
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: 6,
                  borderRadius: 99,
                  background: "#161b22",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 99,
                    background: c.color,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/royiraygan/cash-flow && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/components/CategoryBreakdown.tsx
git commit -m "feat: CategoryBreakdown list replaces ExpenseDonutChart"
```

---

### Task 8: Charts.tsx — dark restyle of SixMonthBarChart, remove ExpenseDonutChart

**Files:**
- Modify: `app/components/Charts.tsx`

**Interfaces:**
- `SixMonthBarChart` keeps same props: `{ data: MonthData[] }` where `MonthData = { name: string; income: number; expenses: number }`.
- `ExpenseDonutChart` export is removed entirely (CategoryBreakdown replaces it).

- [ ] **Step 1: Replace Charts.tsx**

```tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface MonthData {
  name: string;
  income: number;
  expenses: number;
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "#1b2230",
  border: "1px solid #20272f",
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  color: "#f2f5f8",
  fontFamily: "Rubik, sans-serif",
  fontSize: 13,
  borderRadius: 10,
  padding: "10px 14px",
};

function fmtTooltip(v: unknown): string {
  return `₪ ${Math.round(Number(v)).toLocaleString("he-IL")}`;
}

export function SixMonthBarChart({ data }: { data: MonthData[] }) {
  return (
    <div
      style={{
        background: "#1b2230",
        border: "1px solid #20272f",
        borderRadius: 20,
        padding: "18px 20px",
        marginBottom: 12,
      }}
    >
      <p
        style={{
          fontFamily: "Rubik, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: "#f2f5f8",
          marginBottom: 16,
        }}
      >
        הכנסות vs הוצאות — 6 חודשים
      </p>
      <div dir="ltr" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="40%" barSize={12}>
            <CartesianGrid vertical={false} stroke="#161b22" strokeDasharray="0" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7785", fontSize: 11, fontFamily: "Rubik, sans-serif" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7785", fontSize: 11, fontFamily: "Rubik, sans-serif" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `₪${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => fmtTooltip(v)}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="income"   name="הכנסות" fill="#34e0a1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="הוצאות" fill="#ff6b6b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/royiraygan/cash-flow && npm run build
```

Expected: build succeeds. `ExpenseDonutChart` is removed — `app/page.tsx` still imports it at this point, which will cause a compile error. Fix the import in the same step:

In `app/page.tsx`, change:
```ts
import { SixMonthBarChart, ExpenseDonutChart } from "@/app/components/Charts";
```
to:
```ts
import { SixMonthBarChart } from "@/app/components/Charts";
```
And remove `<ExpenseDonutChart data={pieData} />` from the JSX. (Full page.tsx restructure happens in Task 11 — for now just remove the broken import/usage.)

- [ ] **Step 3: Build check after fixing page.tsx import**

```bash
cd /Users/royiraygan/cash-flow && npm run build
```

Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/components/Charts.tsx app/page.tsx
git commit -m "style: dark restyle SixMonthBarChart, remove ExpenseDonutChart"
```

---

### Task 9: TransactionList.tsx dark restyle

**Files:**
- Modify: `app/components/TransactionList.tsx`

**Interfaces:**
- Same props as before: `{ transactions: Transaction[] }` — no change to the shape.
- Accepts an optional `limit` prop (used by Task 11 to cap to 5 rows): `limit?: number`.

- [ ] **Step 1: Replace TransactionList.tsx**

```tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import AddTransactionModal from "./AddTransactionModal";
import Icon from "./Icon";

interface Transaction {
  id: string;
  date: string;
  type: string;
  category: string;
  description: string;
  amount: number;
}

interface Props {
  transactions: Transaction[];
  limit?: number;
}

function getWeekLabel(dateStr: string): string {
  const day = new Date(dateStr).getDate();
  if (day <= 7)  return "שבוע 1";
  if (day <= 14) return "שבוע 2";
  if (day <= 21) return "שבוע 3";
  return "שבוע 4";
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function fmtAmount(n: number): string {
  return n.toLocaleString("he-IL");
}

function weekNet(txs: Transaction[]): number {
  return txs.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const c = CATEGORY_COLORS[tx.category] ?? DEFAULT_CATEGORY_COLOR;

  async function handleDelete() {
    await fetch(`/api/transactions/${tx.id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  return (
    <>
      {editing && <AddTransactionModal editTransaction={tx} onClose={() => setEditing(false)} />}
      <div
        className="group"
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #161b22",
          padding: "12px 16px",
          gap: 10,
          direction: "rtl",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#1b2230")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {/* Icon chip */}
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: c.bg,
            color: c.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon name={c.icon} size={20} />
        </div>

        {/* Description + subtext */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#f2f5f8",
              fontFamily: "Rubik, sans-serif",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {tx.description || tx.category}
          </p>
          <p style={{ fontSize: 11, color: "#6b7785", fontFamily: "Rubik, sans-serif", marginTop: 2 }}>
            {fmtDate(tx.date)} · {tx.category}
          </p>
        </div>

        {/* Amount */}
        <span
          dir="ltr"
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: tx.type === "income" ? "#34e0a1" : "#dfe5ec",
            fontFamily: "Rubik, sans-serif",
            flexShrink: 0,
          }}
        >
          {tx.type === "income" ? "+" : "−"}₪{fmtAmount(tx.amount)}
        </span>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
          {confirm ? (
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                onClick={handleDelete}
                disabled={isPending}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#ff6b6b", fontSize: 12, fontFamily: "Rubik, sans-serif", padding: 0 }}
              >
                {isPending ? "..." : "כן"}
              </button>
              <button
                onClick={() => setConfirm(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6776", fontSize: 12, padding: 0 }}
              >
                לא
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                aria-label="ערוך"
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6776", padding: 4, display: "flex", alignItems: "center", transition: "color 0.1s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#34e0a1")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#5c6776")}
              >
                <Icon name="edit" size={16} />
              </button>
              <button
                onClick={() => setConfirm(true)}
                aria-label="מחק"
                className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6776", padding: 4, display: "flex", alignItems: "center", transition: "color 0.1s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6b6b")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#5c6776")}
              >
                <Icon name="delete" size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default function TransactionList({ transactions, limit }: Props) {
  const displayed = limit ? transactions.slice(0, limit) : transactions;

  if (transactions.length === 0) {
    return (
      <div
        style={{
          background: "#11151b",
          border: "1px solid #1b212a",
          borderRadius: 20,
          padding: 48,
          textAlign: "center",
          color: "#6b7785",
          fontSize: 14,
          fontFamily: "Rubik, sans-serif",
        }}
      >
        אין עסקאות לחודש זה
      </div>
    );
  }

  const grouped: Record<string, Transaction[]> = {};
  for (const tx of displayed) {
    const week = getWeekLabel(tx.date);
    if (!grouped[week]) grouped[week] = [];
    grouped[week].push(tx);
  }

  return (
    <div
      style={{
        background: "#1b2230",
        border: "1px solid #20272f",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      {Object.entries(grouped).map(([week, txs]) => {
        const net = weekNet(txs);
        return (
          <div key={week}>
            <div
              style={{
                padding: "8px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#161b22",
                direction: "rtl",
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 500, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>
                {week}
              </span>
              <span
                dir="ltr"
                style={{ fontSize: 12, fontWeight: 500, color: net >= 0 ? "#34e0a1" : "#ff8f8f", fontFamily: "Rubik, sans-serif" }}
              >
                {net >= 0 ? "+" : "−"}₪{Math.abs(net).toLocaleString("he-IL")}
              </span>
            </div>
            {txs.map((tx) => <TransactionRow key={tx.id} tx={tx} />)}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/royiraygan/cash-flow && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/components/TransactionList.tsx
git commit -m "style: TransactionList dark restyle with icon chips and week net totals"
```

---

### Task 10: AddTransactionModal.tsx dark restyle

**Files:**
- Modify: `app/components/AddTransactionModal.tsx`

**Interfaces:**
- Same props as before: `{ onClose: () => void; editTransaction?: EditTransaction }` — logic is entirely unchanged.

- [ ] **Step 1: Replace AddTransactionModal.tsx**

Full replacement — same state, same submit logic, new visuals:

```tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import Icon from "./Icon";

const INCOME_CATEGORIES  = ["משכורת", "פרילנס", "מסחר", "אחר"];
const EXPENSE_CATEGORIES = ["שכירות", "מזון", "תחבורה", "בילויים", "בריאות", "ביגוד", "חיסכון", "אחר"];

interface EditTransaction {
  id: string;
  date: string;
  type: string;
  category: string;
  description: string;
  amount: number;
}

interface Props {
  onClose: () => void;
  editTransaction?: EditTransaction;
}

function toDateInputValue(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AddTransactionModal({ onClose, editTransaction }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!editTransaction;

  const [type, setType]           = useState<"income" | "expense">(editTransaction ? (editTransaction.type === "income" ? "income" : "expense") : "expense");
  const [date, setDate]           = useState(() => editTransaction ? toDateInputValue(editTransaction.date) : new Date().toISOString().split("T")[0]);
  const [category, setCategory]   = useState(editTransaction?.category ?? EXPENSE_CATEGORIES[0]);
  const [description, setDesc]    = useState(editTransaction?.description ?? "");
  const [amount, setAmount]       = useState(editTransaction ? String(editTransaction.amount) : "");
  const [isMobile, setIsMobile]   = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isEditing) setCategory(type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  }, [type, isEditing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    if (isEditing) {
      await fetch(`/api/transactions/${editTransaction!.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, type, category, description, amount }),
      });
    } else {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, type, category, description, amount }),
      });
    }
    startTransition(() => { router.refresh(); onClose(); });
  }

  const pillRow: React.CSSProperties = {
    background: "#11151b",
    border: "1px solid #1b212a",
    borderRadius: 14,
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  };

  const modalStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        background: "#0d1014",
        borderRadius: "28px 28px 0 0",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
        padding: "24px 20px calc(24px + env(safe-area-inset-bottom))",
        maxHeight: "92vh",
        overflowY: "auto",
      }
    : {
        background: "#0d1014",
        border: "1px solid #20272f",
        borderRadius: 28,
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        padding: "32px",
        width: "100%",
        maxWidth: 460,
      };

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        zIndex: 50,
        padding: isMobile ? 0 : 16,
        direction: "rtl",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={modalStyle}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34,
              borderRadius: "50%",
              background: "#161b22",
              border: "none",
              color: "#9aa6b4",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon name="close" size={18} />
          </button>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
            {isEditing ? "עריכת עסקה" : "עסקה חדשה"}
          </h2>
          {/* Spacer for symmetry */}
          <div style={{ width: 34 }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Segmented toggle */}
          <div
            style={{
              display: "flex",
              background: "#11151b",
              border: "1px solid #1b212a",
              borderRadius: 16,
              padding: 5,
              gap: 4,
            }}
          >
            {(["הוצאה", "הכנסה"] as const).map((label) => {
              const val = label === "הכנסה" ? "income" : "expense";
              const active = type === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => setType(val)}
                  style={{
                    flex: 1,
                    padding: "9px",
                    borderRadius: 12,
                    border: active
                      ? `1px solid ${val === "expense" ? "#4a2228" : "rgba(52,224,161,.3)"}`
                      : "1px solid transparent",
                    background: active
                      ? val === "expense" ? "#2a1418" : "rgba(52,224,161,.12)"
                      : "transparent",
                    color: active
                      ? val === "expense" ? "#ff8f8f" : "#34e0a1"
                      : "#7c8896",
                    fontSize: 14,
                    fontFamily: "Rubik, sans-serif",
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Amount input */}
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <span style={{ fontSize: 24, color: type === "expense" ? "#ff6b6b" : "#34e0a1", fontFamily: "Rubik, sans-serif", fontWeight: 600 }}>
                {type === "expense" ? "−" : "+"}
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                required
                placeholder="0"
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontSize: 52,
                  fontWeight: 600,
                  color: "#f2f5f8",
                  fontFamily: "Rubik, sans-serif",
                  width: "160px",
                  textAlign: "center",
                  direction: "ltr",
                }}
              />
              <span style={{ fontSize: 26, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>₪</span>
            </div>
          </div>

          {/* Category grid */}
          <div>
            <p style={{ fontSize: 12, color: "#7c8896", marginBottom: 10, fontFamily: "Rubik, sans-serif" }}>קטגוריה</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {isEditing ? (
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    gridColumn: "1 / -1",
                    background: "#11151b",
                    border: "1px solid #1b212a",
                    color: "#f2f5f8",
                    borderRadius: 14,
                    padding: "12px 16px",
                    fontSize: 14,
                    fontFamily: "Rubik, sans-serif",
                    outline: "none",
                  }}
                />
              ) : (
                categories.map((cat) => {
                  const c = CATEGORY_COLORS[cat] ?? DEFAULT_CATEGORY_COLOR;
                  const selected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      style={{
                        padding: "12px 8px",
                        borderRadius: 16,
                        border: selected ? `1px solid ${c.color}` : "1px solid #1b212a",
                        background: selected ? c.bg : "#11151b",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        transition: "all 0.15s",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: c.bg,
                          color: c.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon name={c.icon} size={18} />
                      </div>
                      <span style={{ fontSize: 12, color: selected ? "#f2f5f8" : "#9aa6b4", fontFamily: "Rubik, sans-serif" }}>
                        {cat}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Description */}
          <div style={pillRow}>
            <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>תיאור</span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="תיאור קצר (אופציונלי)"
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f2f5f8",
                fontSize: 14,
                fontFamily: "Rubik, sans-serif",
                textAlign: "left",
                flex: 1,
                direction: "ltr",
              }}
            />
          </div>

          {/* Date */}
          <div style={pillRow}>
            <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>תאריך</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f2f5f8",
                fontSize: 14,
                fontFamily: "Rubik, sans-serif",
                colorScheme: "dark",
              }}
            />
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%",
              padding: 16,
              background: "#34e0a1",
              color: "#06231a",
              border: "none",
              borderRadius: 16,
              cursor: isPending ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: 16,
              fontFamily: "Rubik, sans-serif",
              opacity: isPending ? 0.7 : 1,
              marginTop: 4,
              transition: "opacity 0.15s",
            }}
          >
            {isPending ? "שומר..." : isEditing ? "שמירת שינויים" : "שמירת עסקה"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/royiraygan/cash-flow && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/components/AddTransactionModal.tsx
git commit -m "style: AddTransactionModal dark restyle with icon grid and segmented toggle"
```

---

### Task 11: app/page.tsx full restructure

**Files:**
- Modify: `app/page.tsx`
- Delete: `app/components/KPIStrip.tsx`

**Interfaces:**
- Consumes: `BalanceHeroCard` (Task 6), `InOutRow` (Task 6), `CategoryBreakdown` (Task 7), `SixMonthBarChart` (Task 8), `TransactionList` (Task 9) with `limit` prop, `MonthNavigator` (Task 5).

- [ ] **Step 1: Replace app/page.tsx**

```tsx
import { prisma } from "@/lib/prisma";
import MonthNavigator from "@/app/components/MonthNavigator";
import BalanceHeroCard from "@/app/components/BalanceHeroCard";
import InOutRow from "@/app/components/InOutRow";
import { SixMonthBarChart } from "@/app/components/Charts";
import CategoryBreakdown from "@/app/components/CategoryBreakdown";
import TransactionList from "@/app/components/TransactionList";

const HEBREW_MONTHS_SHORT = [
  "ינ","פב","מר","אפ","מי","יו",
  "יל","אג","ספ","אק","נו","דצ",
];

interface PageProps {
  searchParams: { month?: string; year?: string };
}

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: PageProps) {
  const now   = new Date();
  const month = parseInt(searchParams.month ?? String(now.getMonth() + 1));
  const year  = parseInt(searchParams.year  ?? String(now.getFullYear()));

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month,     1);

  const currentTransactions = await prisma.transaction.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: "desc" },
  });

  const totalIncome   = currentTransactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = currentTransactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const barData = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date(year, month - 1 - 5 + i, 1);
      const s = new Date(d.getFullYear(), d.getMonth(), 1);
      const e = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      return prisma.transaction.findMany({ where: { date: { gte: s, lt: e } } }).then((txs) => ({
        name: HEBREW_MONTHS_SHORT[d.getMonth()],
        income:   txs.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
        expenses: txs.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
      }));
    })
  );

  const expenseByCategory: Record<string, number> = {};
  for (const tx of currentTransactions.filter((t) => t.type === "expense")) {
    expenseByCategory[tx.category] = (expenseByCategory[tx.category] ?? 0) + tx.amount;
  }
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const serializedTransactions = currentTransactions.map((t) => ({
    ...t,
    date:      t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <main
      className="min-h-screen"
      style={{
        background: "var(--bg-primary)",
        padding: "0 18px 80px",
        maxWidth: 640,
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      <MonthNavigator month={month} year={year} />

      <BalanceHeroCard totalIncome={totalIncome} totalExpenses={totalExpenses} />

      <InOutRow totalIncome={totalIncome} totalExpenses={totalExpenses} />

      <SixMonthBarChart data={barData} />

      <CategoryBreakdown data={pieData} />

      {/* Recent transactions */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
            direction: "rtl",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
            עסקאות אחרונות
          </span>
          <a href="#" style={{ fontSize: 12, color: "#34e0a1", fontFamily: "Rubik, sans-serif", textDecoration: "none" }}>
            הצג הכל
          </a>
        </div>
        <TransactionList transactions={serializedTransactions} limit={5} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Delete KPIStrip.tsx**

```bash
rm /Users/royiraygan/cash-flow/app/components/KPIStrip.tsx
```

- [ ] **Step 3: Build check**

```bash
cd /Users/royiraygan/cash-flow && npm run build
```

Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git rm app/components/KPIStrip.tsx
git commit -m "refactor: restructure dashboard page — hero card, in/out row, category breakdown, recent transactions"
```

---

### Task 12: subscriptions/page.tsx dark restyle

**Files:**
- Modify: `app/subscriptions/page.tsx`

**Interfaces:**
- Same state/fetch logic as before. Visual-only restyle.

- [ ] **Step 1: Replace app/subscriptions/page.tsx**

Full replacement — same state management, same API calls, new visuals:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import Icon from "@/app/components/Icon";

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
  sub, onEdit, onDelete, onToggle,
}: {
  sub: Subscription;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const c = CATEGORY_COLORS[sub.category] ?? DEFAULT_CATEGORY_COLOR;

  return (
    <div
      className="group"
      style={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid #161b22",
        padding: "12px 16px",
        direction: "rtl",
        gap: 10,
        opacity: sub.isActive ? 1 : 0.45,
        transition: "background 0.1s, opacity 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#20272f")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {/* Icon chip */}
      <div
        style={{
          width: 38, height: 38, borderRadius: 12,
          background: c.bg, color: c.color,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon name={c.icon} size={20} />
      </div>

      {/* Name + day */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <p style={{ fontSize: 14, fontWeight: 500, color: "#f2f5f8", fontFamily: "Rubik, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {sub.name}
        </p>
        <p style={{ fontSize: 11, color: "#6b7785", fontFamily: "Rubik, sans-serif", marginTop: 2 }}>
          כל ה-{sub.dayOfMonth} לחודש
        </p>
      </div>

      {/* Amount */}
      <span
        dir="ltr"
        style={{ fontSize: 14, fontWeight: 600, color: "#ff8f8f", fontFamily: "Rubik, sans-serif", flexShrink: 0 }}
      >
        −₪{sub.amount.toLocaleString("he-IL")}
      </span>

      {/* Toggle */}
      <button
        onClick={onToggle}
        style={{
          background: sub.isActive ? "rgba(52,224,161,.12)" : "#161b22",
          border: `1px solid ${sub.isActive ? "#1c3329" : "#20272f"}`,
          color: sub.isActive ? "#34e0a1" : "#5c6776",
          borderRadius: 99,
          padding: "4px 10px",
          fontSize: 11,
          fontFamily: "Rubik, sans-serif",
          cursor: "pointer",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {sub.isActive ? "פעיל" : "כבוי"}
      </button>

      {/* Edit */}
      <button
        onClick={onEdit}
        className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
        style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6776", padding: 4, display: "flex", alignItems: "center", transition: "color 0.1s" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#34e0a1")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#5c6776")}
      >
        <Icon name="edit" size={16} />
      </button>

      {/* Delete */}
      {confirm ? (
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#ff6b6b", fontSize: 12, fontFamily: "Rubik, sans-serif", padding: 0 }}>כן</button>
          <button onClick={() => setConfirm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6776", fontSize: 12, padding: 0 }}>לא</button>
        </div>
      ) : (
        <button
          onClick={() => setConfirm(true)}
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#5c6776", padding: 4, display: "flex", alignItems: "center", transition: "color 0.1s", flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ff6b6b")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#5c6776")}
        >
          <Icon name="delete" size={16} />
        </button>
      )}
    </div>
  );
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [modal, setModal] = useState<{ open: boolean; editing: Subscription | null }>({ open: false, editing: null });
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

  useEffect(() => { load(); }, [load]);

  const closeModal = useCallback(() => setModal({ open: false, editing: null }), []);

  useEffect(() => {
    if (!modal.open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal.open, closeModal]);

  function openAdd() { setForm(DEFAULT_FORM); setModal({ open: true, editing: null }); }
  function openEdit(sub: Subscription) {
    setForm({ name: sub.name, amount: String(sub.amount), dayOfMonth: String(sub.dayOfMonth), category: sub.category });
    setModal({ open: true, editing: sub });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.editing) {
        await fetch(`/api/subscriptions/${modal.editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, amount: parseFloat(form.amount), dayOfMonth: parseInt(form.dayOfMonth, 10), category: form.category }),
        });
      } else {
        await fetch("/api/subscriptions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, amount: parseFloat(form.amount), dayOfMonth: parseInt(form.dayOfMonth, 10), category: form.category }),
        });
      }
      closeModal(); load();
    } finally { setSaving(false); }
  }

  async function handleToggle(sub: Subscription) {
    await fetch(`/api/subscriptions/${sub.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !sub.isActive }) });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    load();
  }

  const activeTotal   = subscriptions.filter((s) => s.isActive).reduce((sum, s) => sum + s.amount, 0);
  const yearlyTotal   = activeTotal * 12;

  const pillRow: React.CSSProperties = {
    background: "#11151b",
    border: "1px solid #1b212a",
    borderRadius: 14,
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  };

  const modalStyle: React.CSSProperties = isMobile
    ? { position: "fixed", bottom: 0, left: 0, right: 0, background: "#0d1014", borderRadius: "28px 28px 0 0", boxShadow: "0 -8px 40px rgba(0,0,0,0.6)", padding: "24px 20px calc(24px + env(safe-area-inset-bottom))", maxHeight: "92vh", overflowY: "auto" }
    : { background: "#0d1014", border: "1px solid #20272f", borderRadius: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.6)", padding: "32px", width: "100%", maxWidth: 460 };

  return (
    <main
      style={{
        background: "var(--bg-primary)",
        minHeight: "100vh",
        padding: "0 18px 80px",
        maxWidth: 640,
        margin: "0 auto",
        direction: "rtl",
      }}
    >
      {/* Page header */}
      <div style={{ marginTop: 20, marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
          מנויים
        </h1>
      </div>

      {/* Hero card */}
      <div
        style={{
          background: "linear-gradient(155deg, #171d26, #10151c)",
          border: "1px solid #20272f",
          borderRadius: 28,
          padding: 24,
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        <p style={{ fontSize: 12, color: "#7c8896", marginBottom: 8, fontFamily: "Rubik, sans-serif" }}>
          סה״כ הוצאות מנויים
        </p>
        <p
          dir="ltr"
          style={{ fontSize: 46, fontWeight: 600, color: "#818cf8", lineHeight: 1, fontFamily: "Rubik, sans-serif", display: "inline-block" }}
        >
          ₪{activeTotal.toLocaleString("he-IL")}
        </p>
        <p style={{ fontSize: 12, color: "#6b7785", marginTop: 6, fontFamily: "Rubik, sans-serif" }}>
          לחודש · <span dir="ltr">₪{yearlyTotal.toLocaleString("he-IL")}</span> לשנה
        </p>
      </div>

      {/* List card */}
      <div
        style={{
          background: "#1b2230",
          border: "1px solid #20272f",
          borderRadius: 20,
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        {/* List header */}
        <div
          style={{
            padding: "16px 16px",
            borderBottom: "1px solid #161b22",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            direction: "rtl",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
            מנויים ({subscriptions.length})
          </span>
          <button
            onClick={openAdd}
            style={{
              background: "#34e0a1",
              color: "#06231a",
              border: "none",
              borderRadius: 10,
              padding: "7px 14px",
              fontSize: 13,
              fontFamily: "Rubik, sans-serif",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + הוסף מנוי
          </button>
        </div>

        {subscriptions.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#6b7785", fontSize: 14, fontFamily: "Rubik, sans-serif" }}>
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
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            zIndex: 50,
            padding: isMobile ? 0 : 16,
            direction: "rtl",
          }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div style={modalStyle}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <button
                onClick={closeModal}
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#161b22", border: "none", color: "#9aa6b4", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <Icon name="close" size={18} />
              </button>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
                {modal.editing ? "עריכת מנוי" : "מנוי חדש"}
              </h2>
              <div style={{ width: 34 }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Name */}
              <div style={pillRow}>
                <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>שם</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Netflix, גים..."
                  style={{ background: "transparent", border: "none", outline: "none", color: "#f2f5f8", fontSize: 14, fontFamily: "Rubik, sans-serif", textAlign: "left", flex: 1, direction: "ltr" }}
                />
              </div>

              {/* Amount */}
              <div style={pillRow}>
                <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>סכום ₪</span>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  required min="0" step="0.01" placeholder="0"
                  style={{ background: "transparent", border: "none", outline: "none", color: "#f2f5f8", fontSize: 14, fontFamily: "Rubik, sans-serif", textAlign: "left", flex: 1, direction: "ltr" }}
                />
              </div>

              {/* Day of month */}
              <div style={pillRow}>
                <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>יום בחודש</span>
                <input
                  type="number"
                  value={form.dayOfMonth}
                  onChange={(e) => setForm((f) => ({ ...f, dayOfMonth: e.target.value }))}
                  required min="1" max="31" placeholder="1"
                  style={{ background: "transparent", border: "none", outline: "none", color: "#f2f5f8", fontSize: 14, fontFamily: "Rubik, sans-serif", textAlign: "left", flex: 1, direction: "ltr" }}
                />
              </div>

              {/* Category */}
              <div style={pillRow}>
                <span style={{ fontSize: 13, color: "#7c8896", fontFamily: "Rubik, sans-serif" }}>קטגוריה</span>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="מנוי"
                  style={{ background: "transparent", border: "none", outline: "none", color: "#f2f5f8", fontSize: 14, fontFamily: "Rubik, sans-serif", textAlign: "left", flex: 1, direction: "ltr" }}
                />
              </div>

              {/* Save */}
              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%", padding: 16,
                  background: "#34e0a1", color: "#06231a",
                  border: "none", borderRadius: 16,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 600, fontSize: 16, fontFamily: "Rubik, sans-serif",
                  opacity: saving ? 0.7 : 1, marginTop: 4,
                  transition: "opacity 0.15s",
                }}
              >
                {saving ? "שומר..." : modal.editing ? "שמירת שינויים" : "הוסף מנוי"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Build check**

```bash
cd /Users/royiraygan/cash-flow && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/subscriptions/page.tsx
git commit -m "style: subscriptions page dark restyle with hero card and icon chips"
```

---

### Task 13: Final cleanup — delete NavBar.tsx, final build verification

> **Scope:** `layout.tsx` was already switched to AppNav in Task 4. This task only deletes the orphaned file and confirms a clean build.

**Files:**
- Delete: `app/components/NavBar.tsx` (already unreferenced since Task 4)

- [ ] **Step 1: Confirm NavBar.tsx is unreferenced, then delete it**

```bash
grep -r "NavBar" /Users/royiraygan/cash-flow/app /Users/royiraygan/cash-flow/lib
```

Expected: no output (zero references). Then delete:

```bash
rm /Users/royiraygan/cash-flow/app/components/NavBar.tsx
```

- [ ] **Step 2: Final full build**

```bash
cd /Users/royiraygan/cash-flow && npm run build
```

Expected: build succeeds with 0 errors. The output should show pages for `/` and `/subscriptions` generated successfully.

- [ ] **Step 3: Commit**

```bash
git rm app/components/NavBar.tsx
git commit -m "chore: remove NavBar.tsx (superseded by AppNav)"
```

---

## Self-Review Against Spec

**Spec coverage check:**

| Spec requirement | Task(s) |
|---|---|
| globals.css dark tokens | Task 1 |
| tailwind.config.ts dark palette + Rubik sans | Task 1 |
| layout.tsx Rubik font + Material Symbols link | Task 2 |
| Icon helper component | Task 2 |
| AppNav: mobile bottom tab + FAB + desktop top bar | Task 4 |
| FAB opens AddTransactionModal (replaces FloatingAddButton) | Task 4 |
| Delete FloatingAddButton.tsx | Task 4 |
| categoryColors.ts icon field + dark accents | Task 3 |
| MonthNavigator dark restyle | Task 5 |
| BalanceHeroCard with gradient, balance, status pill | Task 6 |
| InOutRow — two income/expense cards | Task 6 |
| SixMonthBarChart dark restyle | Task 8 |
| CategoryBreakdown replaces ExpenseDonutChart | Task 7 |
| TransactionList dark restyle (icon chips, week net, expense color = #dfe5ec not red) | Task 9 |
| TransactionList `limit` prop (cap to 5) + "הצג הכל" link | Task 9 + Task 11 |
| AddTransactionModal dark restyle (all existing logic preserved) | Task 10 |
| subscriptions/page.tsx dark restyle + hero card (indigo accent) | Task 12 |
| Delete KPIStrip.tsx | Task 11 |
| Delete NavBar.tsx | Task 13 |
| npm run build succeeds | Every task |

**Placeholder scan:** None found — every task has complete code blocks.

**Type consistency:**
- `CategoryColor.icon` field added in Task 3, consumed by Tasks 7, 9, 10, 12 — all read `c.icon`.
- `TransactionList` `limit?: number` added in Task 9, used in Task 11 as `limit={5}`.
- `SixMonthBarChart` keeps same `{ data: MonthData[] }` props — Task 8 matches Task 11 usage.
- `BalanceHeroCard` and `InOutRow` defined in Task 6 with `{ totalIncome, totalExpenses }` — Task 11 passes same.
