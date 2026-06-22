import { CATEGORY_COLORS, DEFAULT_CATEGORY_COLOR } from "@/lib/categoryColors";
import Icon from "./Icon";

export interface CategoryStat {
  name: string;
  avg: number;
  currentAmount: number;
  pctVsAvg: number | null;
}

interface Props {
  categories: CategoryStat[];
  hasEnoughData: boolean;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("he-IL");
}

export default function CategoryAverageList({ categories, hasEnoughData }: Props) {
  if (categories.length === 0) return null;

  const maxCurrent = Math.max(...categories.map((c) => c.currentAmount), 1);

  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 13, color: "#7c8896", marginBottom: 12, fontFamily: "Rubik, sans-serif" }}>
        ממוצע לפי קטגוריה
      </p>
      <div
        style={{
          background: "#1b2230",
          border: "1px solid #20272f",
          borderRadius: 20,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {categories.map((cat) => {
          const c = CATEGORY_COLORS[cat.name] ?? DEFAULT_CATEGORY_COLOR;
          const barWidth = maxCurrent > 0 ? (cat.currentAmount / maxCurrent) * 100 : 0;
          const pct = cat.pctVsAvg;
          const isAbove = pct !== null && pct > 3;
          const isBelow = pct !== null && pct < -3;
          const badgeColor = isAbove ? "#ff8f8f" : isBelow ? "#9fd9c2" : "#7c8896";
          const badgeText = isAbove
            ? `+${Math.round(Math.abs(pct!))}% מהממוצע`
            : isBelow
            ? `-${Math.round(Math.abs(pct!))}% מהממוצע`
            : "בקו הממוצע";

          return (
            <div key={cat.name}>
              {/* Icon + name (right) / avg (left) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                  direction: "rtl",
                }}
              >
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
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: "#cdd5de",
                    fontFamily: "Rubik, sans-serif",
                  }}
                >
                  {cat.name}
                </span>
                <span
                  dir="ltr"
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#cdd5de",
                    fontFamily: "Rubik, sans-serif",
                    flexShrink: 0,
                  }}
                >
                  ₪{fmt(cat.avg)}
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: 6,
                  borderRadius: 99,
                  background: "#161b22",
                  overflow: "hidden",
                  marginBottom: hasEnoughData ? 8 : 0,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${barWidth}%`,
                    borderRadius: 99,
                    background: c.color,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>

              {/* Current amount (right) / badge (left) */}
              {hasEnoughData && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    direction: "rtl",
                  }}
                >
                  <span
                    dir="ltr"
                    style={{
                      fontSize: 12,
                      color: "#7c8896",
                      fontFamily: "Rubik, sans-serif",
                    }}
                  >
                    {fmt(cat.currentAmount)} ₪ חודש
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: badgeColor,
                      fontFamily: "Rubik, sans-serif",
                    }}
                  >
                    {badgeText}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
