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
