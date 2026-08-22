"use client";

import { useState } from "react";
import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import Icon from "./Icon";
import CategoryBudgetsModal from "./CategoryBudgetsModal";

interface CategoryData {
  name: string;
  value: number;
}

interface Props {
  data: CategoryData[];
  /** Monthly budget per category. Omit for aggregations that aren't a single month (e.g. the yearly report), where a monthly budget wouldn't be a meaningful comparison — the edit control is hidden too in that case. */
  budgets?: Record<string, number>;
}

const OVER_BUDGET_COLOR = "#ff6b6b";

function fmt(n: number): string {
  return Math.round(n).toLocaleString("he-IL");
}

export default function CategoryBreakdown({ data, budgets }: Props) {
  const [budgetsOpen, setBudgetsOpen] = useState(false);
  const editable = budgets !== undefined;

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
      {budgetsOpen && <CategoryBudgetsModal budgets={budgets ?? {}} onClose={() => setBudgetsOpen(false)} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#f2f5f8", fontFamily: "Rubik, sans-serif" }}>
          לאן הלך הכסף
        </p>
        {editable && (
          <button
            onClick={() => setBudgetsOpen(true)}
            aria-label="הגדרת תקציבים"
            style={{
              width: 26, height: 26,
              borderRadius: "50%",
              background: "#161b22",
              border: "none",
              color: "#7c8896",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Icon name="tune" size={14} />
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {sorted.map(({ name, value }) => {
          const c = CATEGORY_COLORS[name] ?? DEFAULT_CATEGORY_COLOR;
          const budget = budgets?.[name];
          const hasBudget = !!budget && budget > 0;
          const isOver = hasBudget && value > budget;
          const pct = hasBudget
            ? Math.min((value / budget) * 100, 100)
            : max > 0 ? (value / max) * 100 : 0;
          const barColor = isOver ? OVER_BUDGET_COLOR : c.color;

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

                {isOver && (
                  <span style={{ color: OVER_BUDGET_COLOR, display: "flex", flexShrink: 0 }}>
                    <Icon name="warning" size={15} />
                  </span>
                )}

                {/* Amount */}
                <span
                  dir="ltr"
                  style={{
                    fontSize: 13,
                    color: isOver ? OVER_BUDGET_COLOR : "#cdd5de",
                    fontFamily: "Rubik, sans-serif",
                    flexShrink: 0,
                  }}
                >
                  ₪{fmt(value)}{hasBudget && ` / ₪${fmt(budget)}`}
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
                    background: barColor,
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
