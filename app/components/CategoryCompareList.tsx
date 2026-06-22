import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import Icon from "./Icon";

interface Props {
  categoriesA: Record<string, number>;
  categoriesB: Record<string, number>;
  labelA: string;
  labelB: string;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("he-IL");
}

export default function CategoryCompareList({ categoriesA, categoriesB, labelA, labelB }: Props) {
  const allCats = Array.from(new Set([...Object.keys(categoriesA), ...Object.keys(categoriesB)]));

  const rows = allCats
    .map((name) => ({
      name,
      amountA: categoriesA[name] ?? 0,
      amountB: categoriesB[name] ?? 0,
    }))
    .filter((r) => r.amountA > 0 || r.amountB > 0)
    .sort((a, b) => b.amountA - a.amountA);

  if (rows.length === 0) return null;

  return (
    <div>
      <p style={{ fontSize: 13, color: "#7c8896", marginBottom: 12, fontFamily: "Rubik, sans-serif" }}>
        {`לפי קטגוריה • ${labelB} מול ${labelA}`}
      </p>
      <div
        style={{
          background: "#1b2230",
          border: "1px solid #20272f",
          borderRadius: 20,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {rows.map(({ name, amountA, amountB }) => {
          const c = CATEGORY_COLORS[name] ?? DEFAULT_CATEGORY_COLOR;
          const pct = amountB === 0 ? null : ((amountA - amountB) / amountB) * 100;
          // less spending in A vs B = green; more = red
          const badgeColor =
            pct === null
              ? "#9aa6b4"
              : pct < 0
              ? "#9fd9c2"
              : pct > 0
              ? "#ff8f8f"
              : "#9aa6b4";
          const trending =
            pct !== null && amountA !== amountB
              ? amountA > amountB
                ? "trending_up"
                : "trending_down"
              : null;
          const pctText =
            pct === null ? "—" : `${pct > 0 ? "+" : ""}${Math.round(pct)}%`;

          return (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                direction: "rtl",
              }}
            >
              {/* RIGHT: icon */}
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

              {/* Name — flex-1 pushes amounts and badge to the left */}
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

              {/* Amounts B ◂ A */}
              <span
                dir="ltr"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#f2f5f8",
                  fontFamily: "Rubik, sans-serif",
                  flexShrink: 0,
                }}
              >
                ₪{fmt(amountB)} ◂ ₪{fmt(amountA)}
              </span>

              {/* LEFT: badge */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 12,
                  color: badgeColor,
                  fontFamily: "Rubik, sans-serif",
                  fontWeight: 500,
                  flexShrink: 0,
                  minWidth: 44,
                  direction: "ltr",
                }}
              >
                {trending && <Icon name={trending} size={13} />}
                {pctText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
